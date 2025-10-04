import { DemoRequest, DemoRequestStatus } from '../../entities/demo-request.entity';
import { VendorClaim, VendorClaimStatus } from '../../entities/vendor-claim.entity';
import { Vendor } from '../../entities/vendor.entity';
import { calculateGrowth } from './metric-calculators';

export function groupDataByVendor<T extends { vendor: { id: number } }>(items: T[]): Map<number, T[]> {
  const grouped = new Map<number, T[]>();
  items.forEach((item) => {
    const list = grouped.get(item.vendor.id) ?? [];
    list.push(item);
    grouped.set(item.vendor.id, list);
  });
  return grouped;
}

export function buildRecentActivity(demoRequests: DemoRequest[], claims: VendorClaim[]) {
  const activities = [
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
  ];

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
}

export function buildMonthlyTrend(vendorDemoRequests: DemoRequest[]) {
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

  return Array.from(monthlyTrendMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, data]) => ({ month, ...data }));
}

export function buildLeadGenerationData(demoRequests: DemoRequest[]) {
  const leadGenerationMap = new Map<string, { leads: number; demos: number; conversions: number }>();
  
  demoRequests.forEach((request) => {
    const dateKey = request.createdAt ? request.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const bucket = leadGenerationMap.get(dateKey) ?? { leads: 0, demos: 0, conversions: 0 };
    bucket.leads += 1;
    bucket.demos += request.status === DemoRequestStatus.SCHEDULED || request.status === DemoRequestStatus.COMPLETED ? 1 : 0;
    bucket.conversions += request.status === DemoRequestStatus.COMPLETED ? 1 : 0;
    leadGenerationMap.set(dateKey, bucket);
  });

  return Array.from(leadGenerationMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-7)
    .map(([date, data]) => ({ date, ...data }));
}

export function buildGeographicDistribution(demoRequests: DemoRequest[]) {
  return demoRequests
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
}

export async function buildMonthlyGrowth(vendors: Vendor[], demos: DemoRequest[], banks: any[]) {
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const prev30 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [vendorCount, bankCount, demoCount] = [vendors, banks, demos].map((items) =>
    items.filter((item: any) => item.createdAt instanceof Date && item.createdAt >= last30).length,
  );

  const [prevVendorCount, prevBankCount, prevDemoCount] = [vendors, banks, demos].map((items) =>
    items.filter((item: any) => item.createdAt instanceof Date && item.createdAt >= prev30 && item.createdAt < last30).length,
  );

  return {
    vendors: calculateGrowth(vendorCount, prevVendorCount),
    banks: calculateGrowth(bankCount, prevBankCount),
    demoRequests: calculateGrowth(demoCount, prevDemoCount),
  };
}
