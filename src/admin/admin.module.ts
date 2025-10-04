import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Vendor } from '../entities/vendor.entity';
import { VendorProfile } from '../entities/vendor-profile.entity';
import { VendorResearch } from '../entities/vendor-research.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { VendorResearchService } from '../vendor/vendor-research.service';
import { VendorResearchQueue } from '../vendor/vendor-research.queue';
import { VendorClaimModule } from '../vendor-claim/vendor-claim.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Vendor, VendorProfile, VendorResearch]),
    VendorClaimModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, VendorResearchService, VendorResearchQueue],
  exports: [AdminService],
})
export class AdminModule {}
