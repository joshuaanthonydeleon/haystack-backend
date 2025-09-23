import { Entity, PrimaryKey, Property, OneToOne, OneToMany } from '@mikro-orm/core';
import { VendorProfile } from './vendor-profile.entity';
import { User } from './user.entity';
import { Rating } from './rating.entity';
import { DemoRequest } from './demo-request.entity';
import { ComplianceDocument } from './compliance-document.entity';
import { VendorClaim } from './vendor-claim.entity';
import { VendorSubscription } from './vendor-subscription.entity';

@Entity()
export class Vendor {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  companyName!: string;

  @Property({ unique: true, nullable: true })
  website?: string;

  @Property({ default: true })
  isActive!: boolean;

  @OneToOne(() => VendorProfile, profile => profile.vendor, { nullable: true, owner: true })
  profile?: VendorProfile;

  @OneToMany(() => User, user => user.vendor)
  users?: User[] = [];

  @OneToMany(() => Rating, rating => rating.vendor)
  ratings?: Rating[] = [];

  @OneToMany(() => DemoRequest, demoRequest => demoRequest.vendor)
  demoRequests?: DemoRequest[] = [];

  @OneToMany(() => ComplianceDocument, document => document.vendor)
  complianceDocuments?: ComplianceDocument[] = [];

  @OneToMany(() => VendorClaim, claim => claim.vendor)
  vendorClaims?: VendorClaim[] = [];

  @OneToMany(() => VendorSubscription, subscription => subscription.vendor)
  subscriptions?: VendorSubscription[] = [];

  @Property({ type: 'datetime', nullable: true })
  claimedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
