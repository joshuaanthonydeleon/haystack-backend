import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Vendor } from '../entities/vendor.entity';
import { VendorResearch } from '../entities/vendor-research.entity';
import { VendorResearchService } from '../vendor/vendor-research.service';
import { VendorResearchQueue } from '../vendor/vendor-research.queue';

@Injectable()
export class ResearchService {
  private readonly logger = new Logger(ResearchService.name);

  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: EntityRepository<Vendor>,
    @InjectRepository(VendorResearch)
    private readonly vendorResearchRepository: EntityRepository<VendorResearch>,
    private readonly vendorResearchService: VendorResearchService,
    private readonly vendorResearchQueue: VendorResearchQueue,
  ) {}

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
