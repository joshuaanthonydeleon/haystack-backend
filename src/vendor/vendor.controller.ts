import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  Logger,
  Query,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { VendorClaimService } from 'src/vendor-claim/vendor-claim.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateVendorClaimSchema,
  VendorIdParamSchema,
  CreateVendorClaimDto,
  VendorIdParam,
  VendorSearchParamsSchema,
  VendorSearchParams,
  UpdateVendorDto,
  UpdateVendorSchema,
  VendorClaimIdParamSchema,
  VendorClaimIdParam,
  CreateVendorSchema,
  CreateVendorDto,
} from './dto/vendor.validation';
import { GetUser, UserDecorator } from 'src/common/decorators/user.decorator';
import { VendorService } from './vendor.service';
import { VendorResearchService } from './vendor-research.service';
import { ResearchIdParam, ResearchIdParamSchema } from 'src/research/dto/research.dto';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorController {
  private readonly logger: Logger = new Logger(VendorController.name);

  constructor(
    private readonly vendorClaimService: VendorClaimService,
    private readonly vendorService: VendorService,
    private readonly vendorResearchService: VendorResearchService,
  ) { }


  @Get('claims')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async listClaims(@Req() req: any) {
    return this.vendorClaimService.listClaims(req.user);
  }

  @Post(':vendorId/claims')
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  async submitClaim(
    @GetUser() user: UserDecorator,
    @Param(new ZodValidationPipe(VendorIdParamSchema)) { vendorId }: VendorIdParam,
    @Body(new ZodValidationPipe(CreateVendorClaimSchema)) body: CreateVendorClaimDto,
  ) {
    return this.vendorClaimService.submitClaim(user.userId, vendorId, body);
  }

  @Get(':vendorId/claims/:claimId')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async getVendorClaim(
    @Param(new ZodValidationPipe(VendorClaimIdParamSchema)) { vendorId, claimId }: VendorClaimIdParam,
  ) {
    return this.vendorClaimService.getVendorClaimById(vendorId, claimId);
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async searchVendors(
    @Query(new ZodValidationPipe(VendorSearchParamsSchema)) params: VendorSearchParams,
  ) {
    return this.vendorService.searchVendors(params);
  }

  @Get(':vendorId')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async getVendor(@Param(new ZodValidationPipe(VendorIdParamSchema)) { vendorId }: VendorIdParam) {
    return this.vendorService.getVendorById(vendorId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createVendor(@Body(new ZodValidationPipe(CreateVendorSchema)) body: CreateVendorDto) {
    return this.vendorService.createVendor(body);
  }

  @Put(':vendorId')
  @Roles(UserRole.ADMIN)
  async updateVendor(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) { vendorId }: VendorIdParam,
    @Body(new ZodValidationPipe(UpdateVendorSchema)) body: UpdateVendorDto,
  ) {
    return this.vendorService.updateVendor(vendorId, body);
  }

  @Post(':vendorId/research')
  @Roles(UserRole.ADMIN)
  async requestVendorResearch(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) { vendorId }: VendorIdParam,
  ) {
    return this.vendorResearchService.createResearchRequest(vendorId);
  }

  @Get(':vendorId/research')
  @Roles(UserRole.ADMIN)
  async listVendorResearch(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) { vendorId }: VendorIdParam,
  ) {
    return this.vendorResearchService.listResearchForVendor(vendorId);
  }

  @Get(':vendorId/research/:researchId')
  @Roles(UserRole.ADMIN)
  async getVendorResearch(
    @Param(new ZodValidationPipe(ResearchIdParamSchema)) { vendorId, researchId }: ResearchIdParam,
  ) {
    return this.vendorResearchService.getResearchById(vendorId, researchId);
  }
}
