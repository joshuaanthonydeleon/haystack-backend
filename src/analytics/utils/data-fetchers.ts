import { EntityRepository } from '@mikro-orm/core';
import { Vendor } from '../../entities/vendor.entity';
import { VendorProfile } from '../../entities/vendor-profile.entity';
import { DemoRequest } from '../../entities/demo-request.entity';
import { VendorSubscription } from '../../entities/vendor-subscription.entity';
import { Rating } from '../../entities/rating.entity';
import { User, UserRole } from '../../entities/user.entity';
import { ComplianceDocument } from '../../entities/compliance-document.entity';
import { VendorClaim } from '../../entities/vendor-claim.entity';

export interface DataFetchers {
  vendorRepository: EntityRepository<Vendor>;
  vendorProfileRepository: EntityRepository<VendorProfile>;
  demoRequestRepository: EntityRepository<DemoRequest>;
  vendorSubscriptionRepository: EntityRepository<VendorSubscription>;
  ratingRepository: EntityRepository<Rating>;
  userRepository: EntityRepository<User>;
  complianceDocumentRepository: EntityRepository<ComplianceDocument>;
  vendorClaimRepository: EntityRepository<VendorClaim>;
}

export async function fetchAdminData(repositories: DataFetchers) {
  return Promise.all([
    repositories.vendorRepository.findAll({ populate: ['profile'] }),
    repositories.vendorProfileRepository.findAll(),
    repositories.userRepository.find({ role: UserRole.BANK }),
    repositories.demoRequestRepository.findAll({ populate: ['vendor'] }),
    repositories.ratingRepository.findAll({ populate: ['vendor'] }),
    repositories.vendorClaimRepository.findAll({ populate: ['vendor'] }),
  ]);
}

export async function fetchVendorPerformanceData(repositories: DataFetchers) {
  return Promise.all([
    repositories.vendorRepository.findAll({ populate: ['profile'] }),
    repositories.demoRequestRepository.findAll({ populate: ['vendor'] }),
    repositories.vendorSubscriptionRepository.findAll({ populate: ['vendor'] }),
    repositories.ratingRepository.findAll({ populate: ['vendor'] }),
    repositories.complianceDocumentRepository.findAll({ populate: ['vendor'] }),
  ]);
}

export async function fetchVendorDashboardData(vendorId: number, repositories: DataFetchers) {
  return Promise.all([
    repositories.demoRequestRepository.find({ vendor: vendorId }),
    repositories.vendorSubscriptionRepository.find({ vendor: vendorId, isActive: true }),
    repositories.ratingRepository.find({ vendor: vendorId }),
    repositories.complianceDocumentRepository.find({ vendor: vendorId }),
  ]);
}
