import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { VendorModule } from './vendor/vendor.module';
import { DemoRequestModule } from './demo-request/demo-request.module';
import { ComplianceModule } from './compliance/compliance.module';
import { VendorClaimModule } from './vendor-claim/vendor-claim.module';
import { NotificationModule } from './notification/notification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import mikroConfig from 'mikro.config';

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroConfig),
    AuthModule,
    VendorModule,
    DemoRequestModule,
    ComplianceModule,
    VendorClaimModule,
    NotificationModule,
    AnalyticsModule,
  ],
})
export class AppModule { }
