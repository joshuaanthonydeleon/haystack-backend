import { BadRequestException, Body, Controller, Get, Patch, Post, Query, Param, UseGuards, Req } from '@nestjs/common';
import { DemoRequestService } from './demo-request.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CreateDemoRequestDto } from './dto/create-demo-request.dto';
import { UpdateDemoRequestStatusDto } from './dto/update-demo-request-status.dto';

@Controller('demo-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DemoRequestController {
  constructor(private readonly demoRequestService: DemoRequestService) {}

  @Post()
  @Roles(UserRole.BANK, UserRole.ADMIN)
  async create(@Req() req: any, @Body() body: CreateDemoRequestDto) {
    body.vendorId = Number(body.vendorId);
    if (!body.vendorId || Number.isNaN(body.vendorId)) {
      throw new BadRequestException('Invalid vendorId');
    }

    return this.demoRequestService.create(req.user.userId, body);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async list(@Req() req: any, @Query('vendorId') vendorId?: string) {
    let parsedVendorId: number | undefined = undefined;
    if (vendorId) {
      parsedVendorId = parseInt(vendorId, 10);
      if (Number.isNaN(parsedVendorId)) {
        throw new BadRequestException('Invalid vendorId');
      }
    }

    return this.demoRequestService.listForUser(req.user, parsedVendorId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: UpdateDemoRequestStatusDto) {
    const requestId = parseInt(id, 10);
    const demoRequest = await this.demoRequestService.ensureCanAccess(requestId, req.user);
    return this.demoRequestService.updateStatus(demoRequest.id, body);
  }
}
