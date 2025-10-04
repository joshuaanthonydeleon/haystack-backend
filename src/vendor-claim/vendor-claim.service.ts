import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { VendorClaim, VendorClaimStatus } from '../entities/vendor-claim.entity';
import { Vendor } from '../entities/vendor.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateVendorClaimDto } from './dto/create-vendor-claim.dto';
import { DecideVendorClaimDto } from './dto/decide-vendor-claim.dto';

@Injectable()
export class VendorClaimService {
  private readonly logger = new Logger(VendorClaimService.name)

  constructor(
    @InjectRepository(VendorClaim)
    private readonly vendorClaimRepository: EntityRepository<VendorClaim>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: EntityRepository<Vendor>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) { }

  async submitClaim(userId: number, vendorId: number, dto: CreateVendorClaimDto): Promise<VendorClaim> {
    const [vendor, user] = await Promise.all([
      this.vendorRepository.findOne(vendorId),
      this.userRepository.findOne(userId),
    ]);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const claim = this.vendorClaimRepository.create({
      vendor,
      user,
      ...dto,
      status: VendorClaimStatus.PENDING,
    });

    await this.em.persistAndFlush(claim);
    return claim;
  }

  async listClaims(currentUser: { userId: number; role: UserRole }): Promise<VendorClaim[]> {
    if (currentUser.role === UserRole.ADMIN) {
      return this.vendorClaimRepository.find({}, {
        populate: ['vendor', 'user', 'reviewedBy'],
        orderBy: { submittedAt: 'DESC' },
      });
    }

    if (currentUser.role === UserRole.VENDOR) {
      const user = await this.userRepository.findOne(currentUser.userId, { populate: ['vendor'] });
      if (!user?.vendor) {
        throw new ForbiddenException('Vendor account not linked');
      }

      return this.vendorClaimRepository.find({ vendor: user.vendor.id }, {
        populate: ['vendor', 'user', 'reviewedBy'],
        orderBy: { submittedAt: 'DESC' },
      });
    }

    throw new ForbiddenException('Access denied');
  }

  async decideClaim(currentUser: { userId: number; role: UserRole }, claimId: number, dto: DecideVendorClaimDto): Promise<VendorClaim> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins may review claims');
    }

    const claim = await this.vendorClaimRepository.findOne(claimId, { populate: ['vendor', 'reviewedBy'] });
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    const reviewer = await this.userRepository.findOne(currentUser.userId);
    if (!reviewer) {
      throw new NotFoundException('Reviewer not found');
    }

    if (dto.approve) {
      claim.status = VendorClaimStatus.APPROVED;
      claim.reviewedAt = new Date();
      claim.reviewedBy = reviewer;
      claim.rejectionReason = undefined;
      claim.vendor.claimedAt = new Date();
    } else {
      claim.status = VendorClaimStatus.REJECTED;
      claim.reviewedAt = new Date();
      claim.reviewedBy = reviewer;
      claim.rejectionReason = dto.rejectionReason;
    }

    await this.em.flush();
    return claim;
  }

  async getVendorClaimById(vendorId: number, claimId: number): Promise<VendorClaim | null> {
    return this.vendorClaimRepository.findOneOrFail({ id: claimId, vendor: vendorId }, { populate: ['vendor', 'user', 'reviewedBy'] });
  }
}
