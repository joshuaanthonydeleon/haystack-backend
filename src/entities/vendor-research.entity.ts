import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Vendor } from './vendor.entity'

export enum VendorResearchStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class VendorResearch {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => Vendor)
  vendor!: Vendor

  @Enum({ items: () => VendorResearchStatus, default: VendorResearchStatus.PENDING })
  status: VendorResearchStatus = VendorResearchStatus.PENDING

  @Property({ type: 'text', nullable: true })
  websiteUrl?: string

  @Property({ type: 'json', nullable: true })
  websiteSnapshot?: Record<string, unknown>

  @Property({ type: 'json', nullable: true })
  extractedProfile?: Record<string, unknown>

  @Property({ type: 'text', nullable: true })
  discoveredLogoUrl?: string

  @Property({ type: 'json', nullable: true })
  deepResearchInsights?: Record<string, unknown>

  @Property({ type: 'json', nullable: true })
  rawResearchArtifacts?: Record<string, unknown>

  @Property({ type: 'text', nullable: true })
  errorMessage?: string

  @Property({ type: 'text', nullable: true })
  llmModel?: string

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>

  @Property({ type: 'datetime', onCreate: () => new Date() })
  requestedAt: Date = new Date()

  @Property({ type: 'datetime', nullable: true })
  startedAt?: Date

  @Property({ type: 'datetime', nullable: true })
  completedAt?: Date

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}

