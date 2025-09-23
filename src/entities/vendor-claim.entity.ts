import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Vendor } from './vendor.entity';
import { User } from './user.entity';

export enum VendorClaimStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum VerificationMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  WEBSITE = 'website',
  LINKEDIN = 'linkedin',
}

@Entity()
export class VendorClaim {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Vendor)
  vendor!: Vendor;

  @ManyToOne(() => User)
  user!: User;

  @Enum({ items: () => VendorClaimStatus, default: VendorClaimStatus.PENDING })
  status!: VendorClaimStatus;

  @Property({ type: 'text' })
  firstName!: string;

  @Property({ type: 'text' })
  lastName!: string;

  @Property({ type: 'text' })
  email!: string;

  @Property({ type: 'text' })
  phone!: string;

  @Property({ type: 'text' })
  title!: string;

  @Property({ type: 'text' })
  companyEmail!: string;

  @Enum({ items: () => VerificationMethod })
  verificationMethod!: VerificationMethod;

  @Property({ type: 'text', nullable: true })
  message?: string;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  submittedAt?: Date;

  @Property({ type: 'datetime', nullable: true })
  reviewedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  reviewedBy?: User;

  @Property({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
