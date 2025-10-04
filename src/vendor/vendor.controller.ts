import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  Logger,
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
} from './dto/vendor.validation';
import { GetUser, UserDecorator } from 'src/common/decorators/user.decorator';

@Controller('vendor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorController {
  private readonly logger: Logger = new Logger(VendorController.name);

  constructor(
    private readonly vendorClaimService: VendorClaimService,
  ) { }


  @Get('claims')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async listClaims(@Req() req: any) {
    return this.vendorClaimService.listClaims(req.user);
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
