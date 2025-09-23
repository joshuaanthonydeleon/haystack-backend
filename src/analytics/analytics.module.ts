import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Vendor } from '../entities/vendor.entity';
import { VendorProfile } from '../entities/vendor-profile.entity';
import { DemoRequest } from '../entities/demo-request.entity';
import { VendorSubscription } from '../entities/vendor-subscription.entity';
import { Rating } from '../entities/rating.entity';
import { User } from '../entities/user.entity';
import { ComplianceDocument } from '../entities/compliance-document.entity';
import { VendorClaim } from '../entities/vendor-claim.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Vendor,
      VendorProfile,
      DemoRequest,
      VendorSubscription,
      Rating,
      User,
      ComplianceDocument,
      VendorClaim,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
