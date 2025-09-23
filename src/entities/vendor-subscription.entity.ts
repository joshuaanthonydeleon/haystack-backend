import { Entity, Index, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { User } from './user.entity';
import { Vendor } from './vendor.entity';

@Entity()
@Unique({ properties: ['user', 'vendor'] })
@Index({ properties: ['vendor'] })
export class VendorSubscription {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Vendor)
  vendor!: Vendor;

  @Property({ type: 'boolean', default: true })
  isActive!: boolean;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  subscribedAt?: Date;

  @Property({ type: 'datetime', nullable: true })
  unsubscribedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
