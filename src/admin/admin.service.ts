import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Vendor } from '../entities/vendor.entity';
import { VendorProfile, VerificationStatus } from '../entities/vendor-profile.entity';
import { VendorResearch } from '../entities/vendor-research.entity';
import { VendorResearchService } from '../vendor/vendor-research.service';
import { VendorResearchQueue } from '../vendor/vendor-research.queue';
import { VendorClaimService } from '../vendor-claim/vendor-claim.service';
import { UploadCsvResponse } from './dto/upload-csv.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: EntityRepository<Vendor>,
    @InjectRepository(VendorProfile)
    private readonly vendorProfileRepository: EntityRepository<VendorProfile>,
    private readonly vendorResearchService: VendorResearchService,
    private readonly vendorResearchQueue: VendorResearchQueue,
    private readonly vendorClaimService: VendorClaimService,
    private readonly em: EntityManager,
  ) {}

  async listVerificationRequests(): Promise<Vendor[]> {
    return this.vendorRepository.findAll({ 
      populate: ['profile'], 
      where: { profile: { verificationStatus: VerificationStatus.PENDING } } 
    });
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

  async processCsvFile(file: Express.Multer.File): Promise<UploadCsvResponse> {
    // Import the CSV processing logic from vendor service
    const { VendorService } = await import('../vendor/vendor.service');
    const vendorService = new VendorService(
      this.vendorRepository,
      this.vendorProfileRepository,
      {} as any, // ratingRepository - not needed for CSV processing
      {} as any, // em - will be injected properly
    );

    const result = await vendorService.processCsvFile(file);
    
    return {
      message: 'CSV processed successfully',
      success: result.success,
      errors: result.errors,
      totalProcessed: result.success + result.errors.length
    };
  }

  async requestVendorResearch(vendorId: number): Promise<VendorResearch> {
    const research = await this.vendorResearchService.createResearchRequest(vendorId);
    await this.vendorResearchQueue.enqueue(research.id);
    return research;
  }

  async listVendorResearch(vendorId: number): Promise<VendorResearch[]> {
    return this.vendorResearchService.listResearchForVendor(vendorId);
  }

  async getVendorResearch(vendorId: number, researchId: number): Promise<VendorResearch> {
    return this.vendorResearchService.getResearchById(researchId);
  }
}
