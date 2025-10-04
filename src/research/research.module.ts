import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Vendor } from '../entities/vendor.entity';
import { VendorResearch } from '../entities/vendor-research.entity';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { VendorResearchService } from '../vendor/vendor-research.service';
import { VendorResearchQueue } from '../vendor/vendor-research.queue';

@Module({
  imports: [
    MikroOrmModule.forFeature([Vendor, VendorResearch]),
  ],
  controllers: [ResearchController],
  providers: [ResearchService, VendorResearchService, VendorResearchQueue],
  exports: [ResearchService],
})
export class ResearchModule {}
