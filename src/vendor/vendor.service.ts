import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Vendor } from '../entities/vendor.entity';
import { VendorProfile, VendorCategory, VendorSize } from '../entities/vendor-profile.entity';
import { Rating } from '../entities/rating.entity';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

export interface CsvVendorData {
  Company: string;
  'Official Website': string;
  Summary: string;
  'Detailed Description': string;
  Categories: string;
  'Target Customers': string;
  'Search Hints/Keywords': string;
  'Compliance/Certifications': string;
  'Integrations/Core Support': string;
  'Digital Banking Partners': string;
  'Notable Customers (Public)': string;
  'Pricing Notes': string;
  'Source Used (URL)': string;
  'Confidence (0-1)': string;
  'Last Verified (UTC)': string;
  Notes: string;
}

export interface VendorSearchParams {
  q?: string;
  category?: string;
  size?: string;
  page: number;
  limit: number;
}

export interface VendorSearchResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: EntityRepository<Vendor>,
    @InjectRepository(VendorProfile)
    private vendorProfileRepository: EntityRepository<VendorProfile>,
    @InjectRepository(Rating)
    private ratingRepository: EntityRepository<Rating>,
    private readonly em: EntityManager,
  ) { }

  async processCsvFile(file: Express.Multer.File): Promise<{ success: number; errors: string[] }> {
    const results: CsvVendorData[] = [];
    const errors: string[] = [];
    let successCount = 0;

    return new Promise((resolve, reject) => {
      const stream = Readable.from(file.buffer);

      stream
        .pipe(csv())
        .on('data', (data: CsvVendorData) => results.push(data))
        .on('end', async () => {
          try {
            for (const row of results) {
              try {
                await this.processVendorRow(row);
                successCount++;
              } catch (error) {
                errors.push(`Error processing ${row.Company}: ${error.message}`);
              }
            }
            resolve({ success: successCount, errors });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private async processVendorRow(data: CsvVendorData): Promise<void> {
    // Check if vendor already exists
    const existingVendor = await this.vendorRepository.findOne({
      $or: [
        { companyName: data.Company },
        { website: data['Official Website'] }
      ]
    });

    let vendor: Vendor;

    if (existingVendor) {
      // Update existing vendor
      vendor = existingVendor;
      vendor.website = data['Official Website'];
      // updatedAt will be set automatically by onUpdate hook
    } else {
      // Create new vendor - onCreate hooks will set timestamps
      vendor = new Vendor();
      vendor.companyName = data.Company;
      vendor.website = data['Official Website'];
    }

    // Persist vendor (create or update)
    this.em.persist(vendor);

    // Handle vendor profile
    let profile = await this.vendorProfileRepository.findOne({ vendor });

    if (!profile) {
      // Create new profile - onCreate hooks will set timestamps
      profile = new VendorProfile();
      profile.vendor = vendor;
    }
    // If profile exists, onUpdate hook will handle updatedAt

    // Update profile data
    profile.summary = data.Summary || undefined;
    profile.detailedDescription = data['Detailed Description'] || undefined;
    profile.category = this.mapCategory(data.Categories);
    profile.targetCustomers = this.parseJsonField(data['Target Customers']);
    profile.searchHintsKeywords = this.parseJsonField(data['Search Hints/Keywords']);
    profile.complianceCertifications = this.parseJsonField(data['Compliance/Certifications']);
    profile.integrationsCoreSupport = this.parseJsonField(data['Integrations/Core Support']);
    profile.digitalBankingPartners = this.parseJsonField(data['Digital Banking Partners']);
    profile.notableCustomers = this.parseJsonField(data['Notable Customers (Public)']);
    profile.pricingNotes = data['Pricing Notes'] || undefined;
    profile.sourceUrl = data['Source Used (URL)'] || undefined;
    profile.confidence = data['Confidence (0-1)'] ? parseFloat(data['Confidence (0-1)']) : undefined;
    profile.lastVerified = data['Last Verified (UTC)'] ? new Date(data['Last Verified (UTC)']) : undefined;
    profile.notes = data.Notes || undefined;

    // Persist profile (create or update)
    this.em.persist(profile);

    // Flush all changes at once
    await this.em.flush();
  }

  private mapCategory(categoryString: string): VendorCategory | undefined {
    if (!categoryString) return undefined;

    const categoryMap: Record<string, VendorCategory> = {
      'Core, Lending & Digital Banking': VendorCategory.CORE_LENDING_DIGITAL_BANKING,
      'Core & Digital Banking': VendorCategory.CORE_DIGITAL_BANKING,
      'Core, Payments & Risk': VendorCategory.CORE_PAYMENTS_RISK,
      'Core Banking': VendorCategory.CORE_BANKING,
      'Core, Payments & Digital': VendorCategory.CORE_PAYMENTS_DIGITAL,
      'Digital Banking Platform': VendorCategory.DIGITAL_BANKING_PLATFORM,
      'Payments': VendorCategory.PAYMENTS,
      'Lending': VendorCategory.LENDING,
      'Risk & Compliance': VendorCategory.RISK_COMPLIANCE,
      'Analytics': VendorCategory.ANALYTICS,
      'Fintech': VendorCategory.FINTECH,
    };

    return categoryMap[categoryString] || VendorCategory.OTHER;
  }

  private parseJsonField(field: string): string[] | undefined {
    if (!field || field.trim() === '') return undefined;

    // Split by semicolon and clean up
    return field.split(';').map(item => item.trim()).filter(item => item.length > 0);
  }

  async getAllVendors(): Promise<Vendor[]> {
    return this.vendorRepository.findAll({ populate: ['profile'] });
  }

  async getVendorById(id: number): Promise<Vendor | null> {
    return this.vendorRepository.findOne(id, { populate: ['profile', 'ratings'] });
  }

  async searchVendors(params: VendorSearchParams): Promise<VendorSearchResponse> {
    const { q, category, size, page, limit } = params;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where['profile.category'] = category;
    }

    if (size) {
      where['profile.size'] = size;
    }

    const [vendors, total] = await this.vendorRepository.findAndCount(
      where,
      {
        populate: ['profile', 'ratings'],
        limit,
        offset,
        orderBy: { createdAt: 'DESC' }
      }
    );

    // If there's a search query, filter the results
    let filteredVendors = vendors;
    if (q) {
      const query = q.toLowerCase();
      filteredVendors = vendors.filter(vendor => {
        const profile = vendor.profile;
        if (!profile) return false;

        return (
          vendor.companyName.toLowerCase().includes(query) ||
          (profile.description && profile.description.toLowerCase().includes(query)) ||
          (profile.tags && profile.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      });
    }

    return {
      vendors: filteredVendors,
      total: filteredVendors.length,
      page,
      limit,
      hasMore: offset + limit < total
    };
  }

  async getVendorRatings(vendorId: number): Promise<Rating[]> {
    return this.ratingRepository.find(
      { vendor: vendorId },
      {
        populate: ['user'],
        orderBy: { createdAt: 'DESC' }
      }
    );
  }

  async createRating(vendorId: number, ratingData: any): Promise<Rating> {
    const vendor = await this.vendorRepository.findOne(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const rating = new Rating();
    rating.vendor = vendor;
    rating.user = ratingData.userId; // Assuming userId is passed in ratingData
    rating.rating = ratingData.rating;
    rating.isVerified = ratingData.isVerified || false;
    rating.isAnonymous = ratingData.isAnonymous || false;
    rating.tags = ratingData.tags;
    rating.reviewer = ratingData.reviewer;
    rating.reviewerTitle = ratingData.reviewerTitle;

    this.em.persist(rating);
    await this.em.flush();

    return rating;
  }

  async updateVendor(vendorId: number, updateData: any): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne(vendorId, { populate: ['profile'] });
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Update vendor basic info
    if (updateData.companyName) {
      vendor.companyName = updateData.companyName;
    }
    if (updateData.website) {
      vendor.website = updateData.website;
    }
    if (updateData.isActive !== undefined) {
      vendor.isActive = updateData.isActive;
    }

    // Update profile if it exists
    if (vendor.profile) {
      Object.keys(updateData).forEach(key => {
        if (key in vendor.profile! && updateData[key] !== undefined) {
          (vendor.profile as any)[key] = updateData[key];
        }
      });
    }

    this.em.persist(vendor);
    await this.em.flush();

    return vendor;
  }
}