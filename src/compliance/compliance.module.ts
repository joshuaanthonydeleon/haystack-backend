import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ComplianceDocument } from '../entities/compliance-document.entity';
import { DocumentAccessRequest } from '../entities/document-access-request.entity';
import { Vendor } from '../entities/vendor.entity';
import { User } from '../entities/user.entity';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';

@Module({
  imports: [MikroOrmModule.forFeature([ComplianceDocument, DocumentAccessRequest, Vendor, User])],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
