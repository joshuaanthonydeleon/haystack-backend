import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { VendorIdParamSchema, VendorIdParam, CreateRatingDto, CreateRatingSchema } from './dto/rating.dto';
import { GetUser, UserDecorator } from '../common/decorators/user.decorator';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RatingsController {
  private readonly logger: Logger = new Logger(RatingsController.name);

  constructor(
    private readonly ratingsService: RatingsService,
  ) {}

  @Get(':id/ratings')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.BANK)
  async getVendorRatings(
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
  ) {
    return this.ratingsService.getVendorRatings(params.id);
  }

  @Post(':id/ratings')
  @Roles(UserRole.BANK)
  async createRating(
    @GetUser() user: UserDecorator,
    @Param(new ZodValidationPipe(VendorIdParamSchema)) params: VendorIdParam,
    @Body(new ZodValidationPipe(CreateRatingSchema)) ratingData: CreateRatingDto,
  ) {
    return this.ratingsService.createRating(params.id, { ...ratingData, userId: user.userId });
  }
}
