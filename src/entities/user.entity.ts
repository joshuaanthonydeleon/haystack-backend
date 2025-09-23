import { Entity, PrimaryKey, Property, OneToMany, ManyToOne, Enum } from '@mikro-orm/core';
import { Token } from './token.entity';
import { Vendor } from './vendor.entity';
import { DemoRequest } from './demo-request.entity';
import { VendorSubscription } from './vendor-subscription.entity';
import { DocumentAccessRequest } from './document-access-request.entity';
import { VendorClaim } from './vendor-claim.entity';
import { Notification } from './notification.entity';

export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  BANK = 'bank',
}

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  email!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property()
  phone!: string;

  @Property()
  address!: string;

  @Property()
  city!: string;

  @Property()
  state!: string;

  @Property()
  zip!: string;

  @Property()
  country!: string;

  @Property({ nullable: true })
  website?: string;

  @Property({ nullable: true })
  linkedinProfile?: string;

  @Property({ nullable: true })
  facebookProfile?: string;

  @Property({ nullable: true })
  twitterProfile?: string;

  @Property({ nullable: true })
  instagramProfile?: string;

  @Property({ nullable: true })
  youtubeProfile?: string;

  @Property()
  passwordHash!: string;

  @Property({ nullable: true })
  institutionName?: string;

  @Property({ nullable: true })
  title?: string;


  @Enum(() => UserRole)
  role!: UserRole;

  @Property({ default: false })
  isEmailVerified!: boolean;

  @OneToMany(() => Token, token => token.user)
  tokens?: Token[] = [];

  @ManyToOne(() => Vendor, { nullable: true })
  vendor?: Vendor;

  @OneToMany(() => DemoRequest, demoRequest => demoRequest.requester)
  demoRequests?: DemoRequest[] = [];

  @OneToMany(() => VendorSubscription, subscription => subscription.user)
  subscriptions?: VendorSubscription[] = [];

  @OneToMany(() => DocumentAccessRequest, accessRequest => accessRequest.user)
  documentAccessRequests?: DocumentAccessRequest[] = [];

  @OneToMany(() => DocumentAccessRequest, accessRequest => accessRequest.approvedBy)
  approvedAccessRequests?: DocumentAccessRequest[] = [];

  @OneToMany(() => VendorClaim, claim => claim.user)
  vendorClaims?: VendorClaim[] = [];

  @OneToMany(() => VendorClaim, claim => claim.reviewedBy)
  reviewedClaims?: VendorClaim[] = [];

  @OneToMany(() => Notification, notification => notification.user)
  notifications?: Notification[] = [];

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
