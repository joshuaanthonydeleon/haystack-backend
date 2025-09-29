import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Vendor } from '../entities/vendor.entity';
import { VendorProfile, VerificationStatus } from '../entities/vendor-profile.entity';
import { DemoRequest, DemoRequestStatus } from '../entities/demo-request.entity';
import { VendorSubscription } from '../entities/vendor-subscription.entity';
import { Rating } from '../entities/rating.entity';
import { User, UserRole } from '../entities/user.entity';
import { ComplianceDocument } from '../entities/compliance-document.entity';
import { VendorClaim, VendorClaimStatus } from '../entities/vendor-claim.entity';

export interface GrowthMetrics {
  vendors: number;
  banks: number;
  demoRequests: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name)

  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: EntityRepository<Vendor>,
    @InjectRepository(VendorProfile)
    private readonly vendorProfileRepository: EntityRepository<VendorProfile>,
    @InjectRepository(DemoRequest)
    private readonly demoRequestRepository: EntityRepository<DemoRequest>,
    @InjectRepository(VendorSubscription)
    private readonly vendorSubscriptionRepository: EntityRepository<VendorSubscription>,
    @InjectRepository(Rating)
    private readonly ratingRepository: EntityRepository<Rating>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(ComplianceDocument)
    private readonly complianceDocumentRepository: EntityRepository<ComplianceDocument>,
    @InjectRepository(VendorClaim)
    private readonly vendorClaimRepository: EntityRepository<VendorClaim>,
  ) { }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }

    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  private async buildMonthlyGrowth(): Promise<GrowthMetrics> {
    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prev30 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [vendors, banks, demos] = await Promise.all([
      this.vendorRepository.findAll(),
      this.userRepository.find({ role: UserRole.BANK }),
      this.demoRequestRepository.findAll(),
    ]);

    const [vendorCount, bankCount, demoCount] = [vendors, banks, demos].map((items) =>
      items.filter((item: any) => item.createdAt instanceof Date && item.createdAt >= last30).length,
    );

    const [prevVendorCount, prevBankCount, prevDemoCount] = [vendors, banks, demos].map((items) =>
      items.filter((item: any) => item.createdAt instanceof Date && item.createdAt >= prev30 && item.createdAt < last30).length,
    );

    return {
      vendors: this.calculateGrowth(vendorCount, prevVendorCount),
      banks: this.calculateGrowth(bankCount, prevBankCount),
      demoRequests: this.calculateGrowth(demoCount, prevDemoCount),
    };
  }

  async getAdminMetrics() {
    const [vendors, profiles, banks, demoRequests, reviews, claims] = await Promise.all([
      this.vendorRepository.findAll({ populate: ['profile'] }),
      this.vendorProfileRepository.findAll(),
      this.userRepository.find({ role: UserRole.BANK }),
      this.demoRequestRepository.findAll({ populate: ['vendor'] }),
      this.ratingRepository.findAll({ populate: ['vendor'] }),
      this.vendorClaimRepository.findAll({ populate: ['vendor'] }),
    ]);

    const totalVendors = vendors.length;
    const activeVendors = vendors.filter((vendor) => vendor.isActive).length;
    const pendingVerifications = profiles.filter((profile) => profile.verificationStatus === VerificationStatus.PENDING).length;
    const totalBanks = banks.length;
    const totalDemoRequests = demoRequests.length;
    const totalReviews = reviews.length;

    const categoryMap = new Map<string, number>();
    profiles.forEach((profile) => {
      if (profile.category) {
        categoryMap.set(profile.category, (categoryMap.get(profile.category) ?? 0) + 1);
      }
    });

    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count, growth: 0 }));

    const growth = await this.buildMonthlyGrowth();

    this.logger.log('claims', claims)

    const recentActivity = [
      ...demoRequests.map((request) => ({
        id: `demo-${request.id}`,
        type: 'demo_request' as const,
        description: `${request.bankName} requested a demo from ${request.vendor.companyName}`,
        timestamp: request.createdAt?.toISOString() ?? new Date().toISOString(),
        relatedId: String(request.vendor.id),
      })),
      ...claims
        .filter((claim) => claim.status === VendorClaimStatus.PENDING)
        .map((claim) => ({
          id: `claim-${claim.id}`,
          type: 'verification_pending' as const,
          description: `${claim.firstName} ${claim.lastName} submitted a claim for ${claim.vendor.companyName}`,
          timestamp: claim.submittedAt?.toISOString() ?? new Date().toISOString(),
          relatedId: String(claim.vendor.id),
        })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return {
      totalVendors,
      activeVendors,
      pendingVerifications,
      totalBanks,
      totalDemoRequests,
      totalReviews,
      monthlyGrowth: growth,
      topCategories,
      recentActivity,
    };
  }

  async getVendorPerformanceMetrics() {
    const [vendors, demoRequests, subscriptions, ratings, documents] = await Promise.all([
      this.vendorRepository.findAll({ populate: ['profile'] }),
      this.demoRequestRepository.findAll({ populate: ['vendor'] }),
      this.vendorSubscriptionRepository.findAll({ populate: ['vendor'] }),
      this.ratingRepository.findAll({ populate: ['vendor'] }),
      this.complianceDocumentRepository.findAll({ populate: ['vendor'] }),
    ]);

    const demoRequestsByVendor = new Map<number, DemoRequest[]>();
    demoRequests.forEach((request) => {
      const list = demoRequestsByVendor.get(request.vendor.id) ?? [];
      list.push(request);
      demoRequestsByVendor.set(request.vendor.id, list);
    });

    const subscriptionsByVendor = new Map<number, VendorSubscription[]>();
    subscriptions.forEach((subscription) => {
      const list = subscriptionsByVendor.get(subscription.vendor.id) ?? [];
      list.push(subscription);
      subscriptionsByVendor.set(subscription.vendor.id, list);
    });

    const ratingsByVendor = new Map<number, Rating[]>();
    ratings.forEach((rating) => {
      const list = ratingsByVendor.get(rating.vendor.id) ?? [];
      list.push(rating);
      ratingsByVendor.set(rating.vendor.id, list);
    });

    const documentsByVendor = new Map<number, ComplianceDocument[]>();
    documents.forEach((document) => {
      const list = documentsByVendor.get(document.vendor.id) ?? [];
      list.push(document);
      documentsByVendor.set(document.vendor.id, list);
    });

    return vendors.map((vendor) => {
      const vendorDemoRequests = demoRequestsByVendor.get(vendor.id) ?? [];
      const vendorSubscriptions = (subscriptionsByVendor.get(vendor.id) ?? []).filter((sub) => sub.isActive);
      const vendorRatings = ratingsByVendor.get(vendor.id) ?? [];
      const vendorDocuments = documentsByVendor.get(vendor.id) ?? [];

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

      const monthlyTrendMap = new Map<string, { views: number; demos: number; conversions: number }>();
      vendorDemoRequests.forEach((request) => {
        const monthKey = request.createdAt ? `${request.createdAt.getFullYear()}-${String(request.createdAt.getMonth() + 1).padStart(2, '0')}` : 'unknown';
        const bucket = monthlyTrendMap.get(monthKey) ?? { views: 0, demos: 0, conversions: 0 };
        bucket.views += 10; // Placeholder views per request until analytics events are wired
        bucket.demos += 1;
        if (request.status === DemoRequestStatus.COMPLETED) {
          bucket.conversions += 1;
        }
        monthlyTrendMap.set(monthKey, bucket);
      });

      const monthlyTrend = Array.from(monthlyTrendMap.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([month, data]) => ({ month, ...data }));

      return {
        vendorId: String(vendor.id),
        vendorName: vendor.companyName,
        profileViews: monthlyTrend.reduce((sum, entry) => sum + entry.views, 0),
        demoRequests: vendorDemoRequests.length,
        conversionRate,
        averageRating,
        reviewCount,
        documentsDownloaded,
        lastActivityAt: lastActivityAt?.toISOString() ?? new Date().toISOString(),
        monthlyTrend,
      };
    });
  }

  async getVendorDashboard(userId: number) {
    const user = await this.userRepository.findOne(userId, { populate: ['vendor', 'vendor.profile'] });
    if (!user?.vendor) {
      throw new NotFoundException('Vendor account not linked');
    }

    const vendor = user.vendor;
    const [vendorDemoRequests, vendorSubscriptions, vendorRatings, vendorDocuments] = await Promise.all([
      this.demoRequestRepository.find({ vendor: vendor.id }),
      this.vendorSubscriptionRepository.find({ vendor: vendor.id, isActive: true }),
      this.ratingRepository.find({ vendor: vendor.id }),
      this.complianceDocumentRepository.find({ vendor: vendor.id }),
    ]);

    const totalLeads = vendorDemoRequests.length;
    const conversionRate = totalLeads === 0 ? 0 : Number(((vendorSubscriptions.length / totalLeads) * 100).toFixed(1));

    const completedRequests = vendorDemoRequests.filter((request) => request.status === DemoRequestStatus.COMPLETED && request.completedAt && request.createdAt);
    const avgDemoRequestTime = completedRequests.length === 0
      ? 0
      : Number((completedRequests.reduce((sum, request) => sum + ((request.completedAt!.getTime() - request.createdAt!.getTime()) / (1000 * 60 * 60 * 24)), 0) / completedRequests.length).toFixed(1));

    const topPerformingCategory = vendor.profile?.category ?? 'General';

    const leadGenerationMap = new Map<string, { leads: number; demos: number; conversions: number }>();
    vendorDemoRequests.forEach((request) => {
      const dateKey = request.createdAt ? request.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const bucket = leadGenerationMap.get(dateKey) ?? { leads: 0, demos: 0, conversions: 0 };
      bucket.leads += 1;
      bucket.demos += request.status === DemoRequestStatus.SCHEDULED || request.status === DemoRequestStatus.COMPLETED ? 1 : 0;
      bucket.conversions += request.status === DemoRequestStatus.COMPLETED ? 1 : 0;
      leadGenerationMap.set(dateKey, bucket);
    });

    const leadGeneration = Array.from(leadGenerationMap.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-7)
      .map(([date, data]) => ({ date, ...data }));

    const categoryPerformance = [
      {
        category: vendor.profile?.category ?? 'General',
        vendors: 1,
        leads: totalLeads,
        avgRating: vendorRatings.length === 0
          ? 0
          : Number((vendorRatings.reduce((sum, rating) => sum + rating.rating, 0) / vendorRatings.length).toFixed(1)),
      },
    ];

    const geographicDistribution = vendorDemoRequests
      .map((request) => request.bankName)
      .filter(Boolean)
      .map((bankName, index) => ({
        state: 'N/A',
        vendors: 1,
        banks: 1,
        activity: index + 1,
        bankName,
      }))
      .slice(-5)
      .map(({ state, vendors, banks, activity }) => ({ state, vendors, banks, activity }));

    return {
      overview: {
        totalLeads,
        conversionRate,
        avgDemoRequestTime,
        topPerformingCategory,
      },
      leadGeneration,
      categoryPerformance,
      geographicDistribution,
    };
  }
}
