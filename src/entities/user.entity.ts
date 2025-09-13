import { Entity, PrimaryKey, Property, OneToMany, ManyToOne, Enum } from '@mikro-orm/core';
import { Token } from './token.entity';
import { Vendor } from './vendor.entity';

export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
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

  @Property()
  website?: string;

  @Property()
  linkedinProfile?: string;

  @Property()
  facebookProfile?: string;

  @Property()
  twitterProfile?: string;

  @Property()
  instagramProfile?: string;

  @Property()
  youtubeProfile?: string;

  @Property()
  passwordHash!: string;

  @Enum(() => UserRole)
  role!: UserRole;

  @Property({ default: false })
  isEmailVerified!: boolean;

  @OneToMany(() => Token, token => token.user)
  tokens?: Token[] = [];

  @ManyToOne(() => Vendor, { nullable: true })
  vendor?: Vendor;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}