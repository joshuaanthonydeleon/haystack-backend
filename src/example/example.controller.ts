import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('example')
@UseGuards(JwtAuthGuard)
export class ExampleController {
  @Get('public')
  getPublicData() {
    return { message: 'This endpoint requires authentication but no specific role' };
  }

  @Get('admin-only')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminData() {
    return { message: 'This endpoint requires Admin role', data: 'Admin-only data' };
  }

  @Get('vendor-only')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDOR)
  getVendorData() {
    return { message: 'This endpoint requires Vendor role', data: 'Vendor-only data' };
  }

  @Get('admin-or-vendor')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  getAdminOrVendorData() {
    return { message: 'This endpoint requires Admin or Vendor role', data: 'Shared data' };
  }
}