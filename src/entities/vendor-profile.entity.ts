import { Entity, PrimaryKey, Property, OneToOne, Enum } from '@mikro-orm/core';
import { Vendor } from './vendor.entity';
import { User } from './user.entity';

export enum VendorCategory {
  CORE_LENDING_DIGITAL_BANKING = 'Core, Lending & Digital Banking',
  CORE_DIGITAL_BANKING = 'Core & Digital Banking',
  CORE_PAYMENTS_RISK = 'Core, Payments & Risk',
  CORE_BANKING = 'Core Banking',
  CORE_PAYMENTS_DIGITAL = 'Core, Payments & Digital',
  DIGITAL_BANKING_PLATFORM = 'Digital Banking Platform',
  PAYMENTS = 'Payments',
  LENDING = 'Lending',
  RISK_COMPLIANCE = 'Risk & Compliance',
  ANALYTICS = 'Analytics',
  FINTECH = 'Fintech',
  OTHER = 'Other'
}

export enum VendorSize {
  STARTUP = 'startup',
  SMALL = 'small',
  MID_MARKET = 'midMarket',
  ENTERPRISE = 'enterprise'
}

export enum PricingModel {
  SUBSCRIPTION = 'subscription',
  ONE_TIME = 'one-time',
  USAGE_BASED = 'usage-based',
  FREEMIUM = 'freemium'
}

export enum VendorStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export enum VerificationStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  REJECTED = 'rejected'
}

@Entity()
export class VendorProfile {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'text', nullable: true })
  summary?: string;

  @Property({ type: 'text', nullable: true })
  detailedDescription?: string;

  @Enum({ items: () => VendorCategory, nullable: true })
  category?: VendorCategory;

  @Property({ type: 'json', nullable: true })
  subcategories?: string[];

  @Property({ type: 'text', nullable: true })
  location?: string;

  @Enum({ items: () => VendorSize, nullable: true })
  size?: VendorSize;

  @Property({ type: 'text', nullable: true })
  founded?: string;

  @Property({ type: 'text', nullable: true })
  employees?: string;

  @Property({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rating?: number;

  @Property({ type: 'int', nullable: true })
  compatibility?: number;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'text', nullable: true })
  longDescription?: string;

  @Property({ type: 'text', nullable: true })
  website?: string;

  @Property({ type: 'text', nullable: true })
  phone?: string;

  @Property({ type: 'text', nullable: true })
  email?: string;

  @Property({ type: 'text', nullable: true })
  logoUrl?: string;

  @Property({ type: 'json', nullable: true })
  tags?: string[];

  @Property({ type: 'json', nullable: true })
  features?: string[];

  @Property({ type: 'json', nullable: true })
  integrations?: string[];

  @Property({ type: 'json', nullable: true })
  certifications?: string[];

  @Property({ type: 'json', nullable: true })
  clientSize?: string[];

  @Enum({ items: () => PricingModel, nullable: true })
  pricingModel?: PricingModel;

  @Property({ type: 'text', nullable: true })
  priceRange?: string;

  @Enum({ items: () => VendorStatus, default: VendorStatus.PENDING })
  status!: VendorStatus;

  @Enum({ items: () => VerificationStatus, default: VerificationStatus.PENDING })
  verificationStatus!: VerificationStatus;

  @Property({ type: 'datetime', nullable: true })
  lastActivityAt?: Date;

  @Property({ type: 'json', nullable: true })
  targetCustomers?: string[];

  @Property({ type: 'json', nullable: true })
  searchHintsKeywords?: string[];

  @Property({ type: 'json', nullable: true })
  complianceCertifications?: string[];

  @Property({ type: 'json', nullable: true })
  integrationsCoreSupport?: string[];

  @Property({ type: 'json', nullable: true })
  digitalBankingPartners?: string[];

  @Property({ type: 'json', nullable: true })
  notableCustomers?: string[];

  @Property({ type: 'text', nullable: true })
  pricingNotes?: string;

  @Property({ type: 'text', nullable: true })
  sourceUrl?: string;

  @Property({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidence?: number;

  @Property({ type: 'datetime', nullable: true })
  lastVerified?: Date;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @OneToOne(() => Vendor, vendor => vendor.profile)
  vendor!: Vendor;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
