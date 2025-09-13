import { Entity, PrimaryKey, Property, OneToOne, Enum } from '@mikro-orm/core';
import { Vendor } from './vendor.entity';

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
