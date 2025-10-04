import { BadRequestException, Body, Controller, Get, Patch, Post, Query, Param, UseGuards, Req } from '@nestjs/common';
import { DemoRequestService } from './demo-request.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { UpdateDemoRequestStatusDto } from './dto/update-demo-request-status.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CreateDemoRequestSchema, CreateDemoRequestDto, DemoRequestIdParamSchema, DemoRequestIdParam } from './validations/demo-request.validations';

@Controller('demo-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DemoRequestController {
  constructor(private readonly demoRequestService: DemoRequestService) { }

  @Post('/:vendorId')
  @Roles(UserRole.BANK, UserRole.ADMIN)
  async create(
    @Param(new ZodValidationPipe(DemoRequestIdParamSchema)) { vendorId }: DemoRequestIdParam,
    @Body(new ZodValidationPipe(CreateDemoRequestSchema)) body: CreateDemoRequestDto,
  ) {
    return this.demoRequestService.create(vendorId, body);
  }

  @Get('/:vendorId')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async list(@Param(new ZodValidationPipe(DemoRequestIdParamSchema)) { vendorId }: DemoRequestIdParam) {
    return this.demoRequestService.listForUser(vendorId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: UpdateDemoRequestStatusDto) {
    const requestId = parseInt(id, 10);
    const demoRequest = await this.demoRequestService.ensureCanAccess(requestId, req.user);
    return this.demoRequestService.updateStatus(demoRequest.id, body);
  }
}
