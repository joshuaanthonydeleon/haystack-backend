import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VendorService } from './vendor.service';
import { VendorResearchService } from './vendor-research.service';
import { VendorResearchQueue } from './vendor-research.queue';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { VendorClaimService } from 'src/vendor-claim/vendor-claim.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateVendorClaimSchema,
  DecideVendorClaimSchema,
  VendorSearchSchema,
  CreateRatingSchema,
  UpdateVendorSchema,
  VendorIdParamSchema,
  ClaimIdParamSchema,
  ResearchIdParamSchema,
  CreateVendorClaimDto,
  DecideVendorClaimDto,
  VendorSearchDto,
  CreateRatingDto,
  UpdateVendorDto,
  VendorIdParam,
  ClaimIdParam,
  ResearchIdParam,
} from './dto/vendor.validation';
import { GetUser, UserDecorator } from 'src/common/decorators/user.decorator';

@Controller('vendor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorController {
  private readonly logger: Logger = new Logger(VendorController.name);

  constructor(
    private readonly vendorService: VendorService,
    private readonly vendorResearchService: VendorResearchService,
    private readonly vendorResearchQueue: VendorResearchQueue,
    private readonly vendorClaimService: VendorClaimService,
  ) { }

  @Get('verification-requests')
  @Roles(UserRole.ADMIN)
  async listVerificationRequests() {
    return this.vendorService.listVerificationRequests();
  }

  @Post('verification-requests/:id/verify')
  @Roles(UserRole.ADMIN)
  async verifyVendor(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
  ) {
    this.logger.log('VERIFYING VENDOR');

    return this.vendorService.verifyVendor(params.id);
  }

  @Get('claims')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async listClaims(@Req() req: any) {
    return this.vendorClaimService.listClaims(req.user);
  }

  @Post('claims/:claimId/decision')
  @Roles(UserRole.ADMIN)
  async decideClaim(
    @GetUser() user: UserDecorator,
    @Param(new ZodValidationPipe(ClaimIdParamSchema)) params: ClaimIdParam,
    @Body(new ZodValidationPipe(DecideVendorClaimSchema)) body: DecideVendorClaimDto,
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
      const result = await this.vendorService.processCsvFile(file);
      return {
        message: 'CSV processed successfully',
        success: result.success,
        errors: result.errors,
        totalProcessed: result.success + result.errors.length
      };
    } catch (error) {
      throw new BadRequestException(`Error processing CSV: ${error.message}`);
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async getAllVendors() {
    return this.vendorService.getAllVendors();
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.BANK)
  async searchVendors(
    @Query(new ZodValidationPipe(VendorSearchSchema)) searchParams: VendorSearchDto,
  ) {
    return this.vendorService.searchVendors(searchParams);
  }


  @Get(':id/ratings')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.BANK)
  async getVendorRatings(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
  ) {
    return this.vendorService.getVendorRatings(params.id);
  }

  @Post(':id/ratings')
  @Roles(UserRole.BANK)
  async createRating(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
    @Body(new ZodValidationPipe(CreateRatingSchema)) ratingData: CreateRatingDto,
  ) {
    return this.vendorService.createRating(params.id, ratingData);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async updateVendor(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
    @Body(new ZodValidationPipe(UpdateVendorSchema)) updateData: UpdateVendorDto,
  ) {
    this.logger.log('UPDATING VENDOR');
    return this.vendorService.updateVendor(params.id, updateData);
  }

  @Post(':id/research')
  @Roles(UserRole.ADMIN)
  async requestVendorResearch(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
  ) {
    const research = await this.vendorResearchService.createResearchRequest(params.id)
    await this.vendorResearchQueue.enqueue(research.id)

    return research
  }

  @Get(':id/research')
  @Roles(UserRole.ADMIN)
  async listVendorResearch(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
  ) {
    return this.vendorResearchService.listResearchForVendor(params.id)
  }

  @Get(':id/research/:researchId')
  @Roles(UserRole.ADMIN)
  async getVendorResearch(
    @Param(new ZodValidationPipe(ResearchIdParamSchema)) params: ResearchIdParam,
  ) {
    const research = await this.vendorResearchService.getResearchById(params.researchId)
    if (research.vendor.id !== params.id) {
      throw new BadRequestException('Research record does not belong to the requested vendor')
    }

    return research
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.BANK)
  async getVendorById(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
  ) {
    const vendor = await this.vendorService.getVendorById(params.id);
    if (!vendor) {
      throw new BadRequestException('Vendor not found');
    }

    return vendor;
  }

  @Post(':id/claims')
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  async submitClaim(
    @GetUser() user: UserDecorator,
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
    @Body(new ZodValidationPipe(CreateVendorClaimSchema)) body: CreateVendorClaimDto,
  ) {
    return this.vendorClaimService.submitClaim(user.userId, params.id, body);
  }
}
