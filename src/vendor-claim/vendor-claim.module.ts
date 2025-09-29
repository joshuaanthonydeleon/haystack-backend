import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { VendorClaim } from '../entities/vendor-claim.entity';
import { Vendor } from '../entities/vendor.entity';
import { User } from '../entities/user.entity';
import { VendorClaimService } from './vendor-claim.service';

@Module({
  imports: [MikroOrmModule.forFeature([VendorClaim, Vendor, User])],
  controllers: [],
  providers: [VendorClaimService],
  exports: [VendorClaimService],
})
export class VendorClaimModule {}
