import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { VendorClaimService } from '../vendor-claim/vendor-claim.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { VerifyVendorParamSchema, VerifyVendorParam } from './dto/verify-vendor.dto';
import { DecideClaimParamSchema, DecideClaimBodySchema, DecideClaimParam, DecideClaimBody } from './dto/decide-claim.dto';
import { GetUser, UserDecorator } from '../common/decorators/user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  private readonly logger: Logger = new Logger(AdminController.name);

  constructor(
    private readonly adminService: AdminService,
    private readonly vendorClaimService: VendorClaimService,
  ) {}

  @Get('verification-requests')
  @Roles(UserRole.ADMIN)
  async listVerificationRequests() {
    return this.adminService.listVerificationRequests();
  }

  @Post('verification-requests/:id/verify')
  @Roles(UserRole.ADMIN)
  async verifyVendor(
    @Param(new ZodValidationPipe(VerifyVendorParamSchema)) params: VerifyVendorParam,
  ) {
    return this.adminService.verifyVendor(params.id);
  }

  @Post('claims/:claimId/decision')
  @Roles(UserRole.ADMIN)
  async decideClaim(
    @GetUser() user: UserDecorator,
    @Param(new ZodValidationPipe(DecideClaimParamSchema)) params: DecideClaimParam,
    @Body(new ZodValidationPipe(DecideClaimBodySchema)) body: DecideClaimBody,
  ) {
    return this.vendorClaimService.decideClaim(user, params.claimId, body);
  }

  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(UserRole.ADMIN)
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    try {
      return await this.adminService.processCsvFile(file);
    } catch (error) {
      throw new BadRequestException(`Error processing CSV: ${error.message}`);
    }
  }

  @Post('vendor/:id/research')
  @Roles(UserRole.ADMIN)
  async requestVendorResearch(
    @Param(new ZodValidationPipe(VerifyVendorParamSchema)) params: VerifyVendorParam,
  ) {
    return this.adminService.requestVendorResearch(params.id);
  }

  @Get('vendor/:id/research')
  @Roles(UserRole.ADMIN)
  async listVendorResearch(
    @Param(new ZodValidationPipe(VerifyVendorParamSchema)) params: VerifyVendorParam,
  ) {
    return this.adminService.listVendorResearch(params.id);
  }

  @Get('vendor/:id/research/:researchId')
  @Roles(UserRole.ADMIN)
  async getVendorResearch(
    @Param() params: { id: string; researchId: string },
  ) {
    const vendorId = parseInt(params.id);
    const researchId = parseInt(params.researchId);
    
    const research = await this.adminService.getVendorResearch(vendorId, researchId);
    if (research.vendor.id !== vendorId) {
      throw new BadRequestException('Research record does not belong to the requested vendor');
    }

    return research;
  }
}
