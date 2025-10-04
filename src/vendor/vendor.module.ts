import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { Vendor } from '../entities/vendor.entity';
import { VendorProfile } from '../entities/vendor-profile.entity';
import { Rating } from '../entities/rating.entity';
import { VendorResearch } from '../entities/vendor-research.entity';
import { VendorResearchService } from './vendor-research.service';
import { VendorResearchQueue } from './vendor-research.queue';
import { VendorClaimModule } from 'src/vendor-claim/vendor-claim.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Vendor, VendorProfile, Rating, VendorResearch]),
    VendorClaimModule
  ],
  controllers: [VendorController],
  providers: [VendorService, VendorResearchService, VendorResearchQueue],
  exports: [VendorService, VendorResearchService, VendorResearchQueue]
})
export class VendorModule { }
