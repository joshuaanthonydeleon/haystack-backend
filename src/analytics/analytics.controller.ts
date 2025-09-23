import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('admin/metrics')
  @Roles(UserRole.ADMIN)
  async getAdminMetrics() {
    return this.analyticsService.getAdminMetrics();
  }

  @Get('admin/vendor-performance')
  @Roles(UserRole.ADMIN)
  async getVendorPerformance() {
    return this.analyticsService.getVendorPerformanceMetrics();
  }

  @Get('vendor/dashboard')
  @Roles(UserRole.VENDOR)
  async getVendorDashboard(@Req() req: any) {
    return this.analyticsService.getVendorDashboard(req.user.userId);
  }
}
