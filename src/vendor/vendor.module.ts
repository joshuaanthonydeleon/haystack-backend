import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { Vendor } from '../entities/vendor.entity';
import { VendorProfile } from '../entities/vendor-profile.entity';
import { Rating } from '../entities/rating.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Vendor, VendorProfile, Rating])
  ],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService]
})
export class VendorModule {}
