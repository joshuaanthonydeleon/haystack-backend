import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/core';
import { Vendor } from './vendor.entity';
import { User } from './user.entity';

@Entity()
@Index({ properties: ['vendor', 'user'] })
export class Rating {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Vendor)
  vendor!: Vendor;

  @ManyToOne(() => User)
  user!: User;

  @Property({ type: 'int' })
  rating!: number;

  @Property({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Property({ type: 'boolean', default: false })
  isAnonymous!: boolean;

  @Property({ type: 'json', nullable: true })
  tags?: string[];

  @Property({ type: 'text', nullable: true })
  reviewer?: string;

  @Property({ type: 'text', nullable: true })
  reviewerTitle?: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
