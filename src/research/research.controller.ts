import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ResearchService } from './research.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { VendorIdParamSchema, VendorIdParam, ResearchIdParamSchema, ResearchIdParam } from './dto/research.dto';

@Controller('research')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResearchController {
  private readonly logger: Logger = new Logger(ResearchController.name);

  constructor(
    private readonly researchService: ResearchService,
  ) {}

  @Post('vendor/:id')
  @Roles(UserRole.ADMIN)
  async requestVendorResearch(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
  ) {
    return this.researchService.requestVendorResearch(params.id);
  }

  @Get('vendor/:id')
  @Roles(UserRole.ADMIN)
  async listVendorResearch(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
  ) {
    return this.researchService.listVendorResearch(params.id);
  }

  @Get('vendor/:id/:researchId')
  @Roles(UserRole.ADMIN)
  async getVendorResearch(
    @Param(new ZodValidationPipe(ResearchIdParamSchema)) params: ResearchIdParam,
  ) {
    const research = await this.researchService.getVendorResearch(params.id, params.researchId);
    if (research.vendor.id !== params.id) {
      throw new BadRequestException('Research record does not belong to the requested vendor');
    }

    return research;
  }
}
