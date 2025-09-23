import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CreateComplianceDocumentDto } from './dto/create-compliance-document.dto';
import { RequestDocumentAccessDto } from './dto/request-document-access.dto';
import { DecideDocumentAccessDto } from './dto/decide-document-access.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('vendor/:vendorId/documents')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.BANK)
  async listDocuments(@Param('vendorId') vendorId: string) {
    const parsedVendorId = parseInt(vendorId, 10);
    if (Number.isNaN(parsedVendorId)) {
      throw new BadRequestException('Invalid vendorId');
    }

    return this.complianceService.listDocumentsForVendor(parsedVendorId);
  }

  @Post('vendor/:vendorId/documents')
  @Roles(UserRole.ADMIN)
  async createDocument(
    @Param('vendorId') vendorId: string,
    @Body() body: CreateComplianceDocumentDto,
  ) {
    const parsedVendorId = parseInt(vendorId, 10);
    if (Number.isNaN(parsedVendorId)) {
      throw new BadRequestException('Invalid vendorId');
    }

    return this.complianceService.createDocument(parsedVendorId, body);
  }

  @Post('documents/:documentId/access-requests')
  @Roles(UserRole.BANK, UserRole.ADMIN, UserRole.VENDOR)
  async requestDocumentAccess(
    @Req() req: any,
    @Param('documentId') documentId: string,
    @Body() body: RequestDocumentAccessDto,
  ) {
    const parsedDocumentId = parseInt(documentId, 10);
    if (Number.isNaN(parsedDocumentId)) {
      throw new BadRequestException('Invalid documentId');
    }

    return this.complianceService.requestAccess(req.user.userId, parsedDocumentId, body);
  }

  @Get('documents/access-requests')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async listAccessRequests(@Req() req: any) {
    return this.complianceService.listAccessRequestsForVendor(req.user);
  }

  @Post('documents/access-requests/:requestId/decision')
  @Roles(UserRole.ADMIN)
  async decideAccessRequest(
    @Req() req: any,
    @Param('requestId') requestId: string,
    @Body() body: DecideDocumentAccessDto,
  ) {
    const parsedRequestId = parseInt(requestId, 10);
    if (Number.isNaN(parsedRequestId)) {
      throw new BadRequestException('Invalid requestId');
    }

    return this.complianceService.decideAccessRequest(req.user, parsedRequestId, body);
  }
}
