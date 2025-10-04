import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, FilterQuery, QueryOrder } from '@mikro-orm/core';
import { Vendor } from '../entities/vendor.entity';
import { VendorProfile, VendorCategory, VendorSize, VendorStatus, VerificationStatus } from '../entities/vendor-profile.entity';
import { Rating } from '../entities/rating.entity';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.validation';
import { CsvVendorData, VendorSearchResponse } from './types';
import { VendorSearchParams } from './dto/vendor.validation';
@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name)

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
    await this.em.persistAndFlush(profile);
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
    const {
      q,
      category,
      size,
      status,
      page = 1,
      limit = 10,
    } = params;

    const pageNumber = Math.max(1, page);
    const pageSize = Math.min(Math.max(limit, 1), 200);
    const offset = (pageNumber - 1) * pageSize;

    const where: FilterQuery<Vendor> = {};
    const andConditions: FilterQuery<Vendor>[] = [];

    if (category || size || status) {
      const profileQuery: FilterQuery<VendorProfile> = {};

      if (category) {
        profileQuery.category = category as VendorCategory;
      }

      if (size) {
        profileQuery.size = size as VendorSize;
      }

      if (status) {
        profileQuery.status = status as VendorStatus;
      }

      andConditions.push({ profile: profileQuery });
    }

    if (q) {
      const likeQuery = `%${q}%`;
      const searchConditions: FilterQuery<Vendor>[] = [
        { companyName: { $ilike: likeQuery } },
        { website: { $ilike: likeQuery } },
        { profile: { summary: { $ilike: likeQuery } } },
        { profile: { detailedDescription: { $ilike: likeQuery } } },
        { profile: { email: { $ilike: likeQuery } } },
      ];

      andConditions.push({ $or: searchConditions });
    }

    const [vendors, total] = await this.vendorRepository.findAndCount(andConditions.length ? { $and: andConditions } : where, {
      populate: ['profile', 'ratings'],
      limit: pageSize,
      offset,
      orderBy: { createdAt: QueryOrder.DESC },
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return {
      vendors,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasMore: totalPages > 0 && pageNumber < totalPages,
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

    await this.em.persistAndFlush(rating);

    return rating;
  }

  async updateVendor(vendorId: number, updateData: UpdateVendorDto): Promise<Vendor> {
    try {
      const vendor = await this.vendorRepository.findOne({ id: vendorId }, { populate: ['profile'] })
      if (!vendor) {
        throw new Error('Vendor not found')
      }

      // Update vendor basic info
      if (updateData.companyName) {
        vendor.companyName = updateData.companyName
      }

      if (updateData.website) {
        const website = updateData.website
        vendor.website = website === null || website === '' ? undefined : website
      }

      if (updateData.isActive) {
        vendor.isActive = updateData.isActive
      }

      // Ensure vendor profile exists when profile fields are provided
      const profileFieldKeys = [
        'summary',
        'detailedDescription',
        'category',
        'size',
        'location',
        'founded',
        'employees',
        'phone',
        'email',
        'logoUrl',
        'pricingModel',
        'priceRange',
        'status',
        'verificationStatus',
        'tags',
        'features',
        'integrations',
        'targetCustomers',
        'pricingNotes',
        'notes',
        'searchHintsKeywords',
        'complianceCertifications',
        'integrationsCoreSupport',
        'digitalBankingPartners',
        'notableCustomers',
        'sourceUrl',
        'confidence',
        'lastVerified',
      ]

      const hasProfileUpdates = profileFieldKeys.some((key) => key in updateData)

      if (hasProfileUpdates && !vendor.profile) {
        const profile = new VendorProfile()
        profile.vendor = vendor
        vendor.profile = profile
        this.em.persist(profile)
      }

      if (vendor.profile && hasProfileUpdates) {
        const profile = vendor.profile

        profileFieldKeys.forEach((key) => {
          if (!(key in updateData)) {
            return
          }

          const value = updateData[key]

          // Skip null updates for non-nullable fields
          if ((key === 'status' || key === 'verificationStatus') && value === null) {
            return
          }

          if (key === 'lastVerified' && value !== undefined) {
            profile.lastVerified = value === null ? undefined : new Date(value)
            return
          }

          if (key === 'confidence' && value !== undefined) {
            profile.confidence = value === null ? null : value
            return
          }

          // Handle nullable string fields to ensure empty strings become null
          if (
            [
              'summary',
              'detailedDescription',
              'location',
              'founded',
              'employees',
              'phone',
              'email',
              'logoUrl',
              'priceRange',
              'pricingNotes',
              'notes',
              'sourceUrl',
            ].includes(key)
          ) {
            ; (profile as any)[key] = value === null || value === '' ? null : value
            return
          }

          ; (profile as any)[key] = value
        })
      }

      await this.em.persistAndFlush(vendor)

      return vendor
    } catch (error) {
      this.logger.error('Error updating vendor', error)
      throw error
    }
  }

  async listVerificationRequests(): Promise<Vendor[]> {
    return this.vendorRepository.findAll({ populate: ['profile'], where: { profile: { verificationStatus: VerificationStatus.PENDING } } });
  }

  async verifyVendor(id: number): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne(id, { populate: ['profile'] });
    if (!vendor || !vendor.profile) {
      throw new Error('Vendor not found');
    }

    vendor.profile.verificationStatus = VerificationStatus.VERIFIED;
    await this.em.persistAndFlush(vendor);

    return vendor;
  }

  async createVendor(createData: CreateVendorDto): Promise<Vendor> {
    const vendor = new Vendor();
    vendor.companyName = createData.companyName;
    vendor.website = createData.website;
    vendor.isActive = createData.isActive;

    const profile = new VendorProfile();
    profile.vendor = vendor;
    profile.summary = createData.summary;
    profile.detailedDescription = createData.detailedDescription;
    profile.category = createData.category;
    profile.size = createData.size;
    profile.location = createData.location;
    profile.founded = createData.founded;
    profile.employees = createData.employees;
    profile.phone = createData.phone;
    profile.email = createData.email;
    profile.logoUrl = createData.logoUrl;
    profile.pricingModel = createData.pricingModel;
    profile.priceRange = createData.priceRange;
    profile.status = createData.status;
    profile.verificationStatus = createData.verificationStatus;
    profile.tags = createData.tags;
    profile.features = createData.features;
    profile.integrations = createData.integrations;
    profile.targetCustomers = createData.targetCustomers;
    profile.pricingNotes = createData.pricingNotes;
    profile.notes = createData.notes;
    profile.searchHintsKeywords = createData.searchHintsKeywords;
    profile.complianceCertifications = createData.complianceCertifications;
    profile.integrationsCoreSupport = createData.integrationsCoreSupport;
    profile.digitalBankingPartners = createData.digitalBankingPartners;
    profile.notableCustomers = createData.notableCustomers;
    profile.sourceUrl = createData.sourceUrl;

    await this.em.persistAndFlush(vendor);

    return vendor;
  }
}