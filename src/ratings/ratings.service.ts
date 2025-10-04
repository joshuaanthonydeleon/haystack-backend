import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Vendor } from '../entities/vendor.entity';
import { Rating } from '../entities/rating.entity';
import { CreateRatingDto } from './dto/rating.dto';

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: EntityRepository<Vendor>,
    @InjectRepository(Rating)
    private readonly ratingRepository: EntityRepository<Rating>,
    private readonly em: EntityManager,
  ) { }

  async getVendorRatings(vendorId: number): Promise<Rating[]> {
    return this.ratingRepository.find(
      { vendor: vendorId },
      {
        populate: ['user'],
        orderBy: { createdAt: 'DESC' }
      }
    );
  }

  async createRating(vendorId: number, ratingData: CreateRatingDto & { userId: number }): Promise<Rating> {
    const vendor = await this.vendorRepository.findOne(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const rating = new Rating();
    rating.vendor = vendor;
    rating.user.id = ratingData.userId;
    rating.rating = ratingData.rating;
    rating.isVerified = false;
    rating.isAnonymous = false;
    rating.tags = ratingData.comment ? [ratingData.comment] : undefined;
    rating.reviewer = ratingData.comment || undefined;
    rating.reviewerTitle = undefined;

    await this.em.persistAndFlush(rating);
    return rating;
  }
}
