import { Vendor } from '../../entities/vendor.entity';
import { VendorProfile, VerificationStatus } from '../../entities/vendor-profile.entity';
import { DemoRequest, DemoRequestStatus } from '../../entities/demo-request.entity';
import { VendorSubscription } from '../../entities/vendor-subscription.entity';
import { Rating } from '../../entities/rating.entity';
import { User } from '../../entities/user.entity';
import { ComplianceDocument } from '../../entities/compliance-document.entity';

export function calculateBasicMetrics(
  vendors: Vendor[], 
  profiles: VendorProfile[], 
  banks: User[], 
  demoRequests: DemoRequest[], 
  reviews: Rating[]
) {
  return {
    totalVendors: vendors.length,
    activeVendors: vendors.filter((vendor) => vendor.isActive).length,
    pendingVerifications: profiles.filter((profile) => profile.verificationStatus === VerificationStatus.PENDING).length,
    totalBanks: banks.length,
    totalDemoRequests: demoRequests.length,
    totalReviews: reviews.length,
  };
}

export function calculateTopCategories(profiles: VendorProfile[]) {
  const categoryMap = new Map<string, number>();
  profiles.forEach((profile) => {
    if (profile.category) {
      categoryMap.set(profile.category, (categoryMap.get(profile.category) ?? 0) + 1);
    }
  });

  return Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, count]) => ({ category, count, growth: 0 }));
}

export function calculateVendorMetrics(
  vendor: Vendor,
  vendorDemoRequests: DemoRequest[],
  vendorSubscriptions: VendorSubscription[],
  vendorRatings: Rating[],
  vendorDocuments: ComplianceDocument[]
) {
  const conversionRate = vendorDemoRequests.length === 0
    ? 0
    : Number(((vendorSubscriptions.length / vendorDemoRequests.length) * 100).toFixed(1));

  const averageRating = vendorRatings.length === 0
    ? 0
    : Number((vendorRatings.reduce((sum, rating) => sum + rating.rating, 0) / vendorRatings.length).toFixed(1));

  const reviewCount = vendorRatings.length;
  const documentsDownloaded = vendorDocuments.reduce((sum, document) => sum + (document.downloadCount ?? 0), 0);

  const lastActivityAt = [
    vendor.updatedAt,
    vendorDemoRequests[0]?.createdAt,
    vendorDocuments[0]?.lastUpdated,
  ]
    .filter((date): date is Date => date instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return {
    conversionRate,
    averageRating,
    reviewCount,
    documentsDownloaded,
    lastActivityAt,
  };
}

export function calculateDemoRequestTime(demoRequests: DemoRequest[]) {
  const completedRequests = demoRequests.filter((request) => 
    request.status === DemoRequestStatus.COMPLETED && 
    request.completedAt && 
    request.createdAt
  );

  return completedRequests.length === 0
    ? 0
    : Number((completedRequests.reduce((sum, request) => 
        sum + ((request.completedAt!.getTime() - request.createdAt!.getTime()) / (1000 * 60 * 60 * 24)), 0) / 
        completedRequests.length).toFixed(1));
}

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}
