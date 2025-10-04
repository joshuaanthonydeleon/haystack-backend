import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Vendor } from '../entities/vendor.entity';
import { VendorProfile } from '../entities/vendor-profile.entity';
import { DemoRequest } from '../entities/demo-request.entity';
import { VendorSubscription } from '../entities/vendor-subscription.entity';
import { Rating } from '../entities/rating.entity';
import { User } from '../entities/user.entity';
import { ComplianceDocument } from '../entities/compliance-document.entity';
import { VendorClaim } from '../entities/vendor-claim.entity';
import { 
  fetchAdminData, 
  fetchVendorPerformanceData, 
  fetchVendorDashboardData,
  DataFetchers,
  calculateBasicMetrics, 
  calculateTopCategories, 
  calculateVendorMetrics, 
  calculateDemoRequestTime,
  groupDataByVendor, 
  buildRecentActivity, 
  buildMonthlyTrend, 
  buildLeadGenerationData, 
  buildGeographicDistribution, 
  buildMonthlyGrowth 
} from './utils';

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

  private get repositories(): DataFetchers {
    return {
      vendorRepository: this.vendorRepository,
      vendorProfileRepository: this.vendorProfileRepository,
      demoRequestRepository: this.demoRequestRepository,
      vendorSubscriptionRepository: this.vendorSubscriptionRepository,
      ratingRepository: this.ratingRepository,
      userRepository: this.userRepository,
      complianceDocumentRepository: this.complianceDocumentRepository,
      vendorClaimRepository: this.vendorClaimRepository,
    };
  }

  async getAdminMetrics() {
    const [vendors, profiles, banks, demoRequests, reviews, claims] = await fetchAdminData(this.repositories);

    const basicMetrics = calculateBasicMetrics(vendors, profiles, banks, demoRequests, reviews);
    const topCategories = calculateTopCategories(profiles);
    const growth = await buildMonthlyGrowth(vendors, demoRequests, banks);
    const recentActivity = buildRecentActivity(demoRequests, claims);

    return {
      ...basicMetrics,
      monthlyGrowth: growth,
      topCategories,
      recentActivity,
    };
  }

  async getVendorPerformanceMetrics() {
    const [vendors, demoRequests, subscriptions, ratings, documents] = await fetchVendorPerformanceData(this.repositories);

    const demoRequestsByVendor = groupDataByVendor(demoRequests);
    const subscriptionsByVendor = groupDataByVendor(subscriptions);
    const ratingsByVendor = groupDataByVendor(ratings);
    const documentsByVendor = groupDataByVendor(documents);

    return vendors.map((vendor) => {
      const vendorDemoRequests = demoRequestsByVendor.get(vendor.id) ?? [];
      const vendorSubscriptions = (subscriptionsByVendor.get(vendor.id) ?? []).filter((sub) => sub.isActive);
      const vendorRatings = ratingsByVendor.get(vendor.id) ?? [];
      const vendorDocuments = documentsByVendor.get(vendor.id) ?? [];

      const metrics = calculateVendorMetrics(
        vendor,
        vendorDemoRequests,
        vendorSubscriptions,
        vendorRatings,
        vendorDocuments
      );

      const monthlyTrend = buildMonthlyTrend(vendorDemoRequests);

      return {
        vendorId: String(vendor.id),
        vendorName: vendor.companyName,
        profileViews: monthlyTrend.reduce((sum, entry) => sum + entry.views, 0),
        demoRequests: vendorDemoRequests.length,
        ...metrics,
        lastActivityAt: metrics.lastActivityAt?.toISOString() ?? new Date().toISOString(),
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
    const [vendorDemoRequests, vendorSubscriptions, vendorRatings] = await fetchVendorDashboardData(vendor.id, this.repositories);

    const totalLeads = vendorDemoRequests.length;
    const conversionRate = totalLeads === 0 ? 0 : Number(((vendorSubscriptions.length / totalLeads) * 100).toFixed(1));
    const avgDemoRequestTime = calculateDemoRequestTime(vendorDemoRequests);
    const topPerformingCategory = vendor.profile?.category ?? 'General';

    const leadGeneration = buildLeadGenerationData(vendorDemoRequests);

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

    const geographicDistribution = buildGeographicDistribution(vendorDemoRequests);

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
