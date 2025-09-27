import { BadRequestException, Body, Controller, Get, Logger, Param, Post, Req, UseGuards } from '@nestjs/common';
import { VendorClaimService } from './vendor-claim.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CreateVendorClaimDto } from './dto/create-vendor-claim.dto';
import { DecideVendorClaimDto } from './dto/decide-vendor-claim.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorClaimController {
  private readonly logger = new Logger(VendorClaimController.name)

  constructor(private readonly vendorClaimService: VendorClaimService) { }

  @Post('vendor/:vendorId/claims')
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  async submitClaim(
    @Req() req: any,
    @Param('vendorId') vendorId: string,
    @Body() body: CreateVendorClaimDto,
  ) {
    const parsedVendorId = parseInt(vendorId, 10);
    if (Number.isNaN(parsedVendorId)) {
      throw new BadRequestException('Invalid vendorId');
    }

    return this.vendorClaimService.submitClaim(req.user.userId, parsedVendorId, body);
  }

  @Get('vendor/claims')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async listClaims(@Req() req: any) {
    this.logger.log('Listing claims');
    return this.vendorClaimService.listClaims(req.user);
  }

  @Post('vendor/claims/:claimId/decision')
  @Roles(UserRole.ADMIN)
  async decideClaim(
    @Req() req: any,
    @Param('claimId') claimId: string,
    @Body() body: DecideVendorClaimDto,
  ) {
    const parsedClaimId = parseInt(claimId, 10);
    if (Number.isNaN(parsedClaimId)) {
      throw new BadRequestException('Invalid claimId');
    }

    return this.vendorClaimService.decideClaim(req.user, parsedClaimId, body);
  }
}
