import { Entity, PrimaryKey, Property, OneToOne, OneToMany } from '@mikro-orm/core';
import { VendorProfile } from './vendor-profile.entity';
import { User } from './user.entity';

@Entity()
export class Vendor {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  companyName!: string;

  @Property({ unique: true })
  website!: string;

  @Property({ default: true })
  isActive!: boolean;

  @OneToOne(() => VendorProfile, profile => profile.vendor, { nullable: true, owner: true })
  profile?: VendorProfile;

  @OneToMany(() => User, user => user.vendor)
  users?: User[] = [];

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;
}
