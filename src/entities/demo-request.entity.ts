import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Vendor } from './vendor.entity';
import { User } from './user.entity';

export enum DemoRequestStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity()
export class DemoRequest {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Vendor)
  vendor!: Vendor;

  @ManyToOne(() => User)
  requester!: User;

  @Enum({ items: () => DemoRequestStatus, default: DemoRequestStatus.PENDING })
  status!: DemoRequestStatus;

  @Property({ type: 'text' })
  firstName!: string;

  @Property({ type: 'text' })
  lastName!: string;

  @Property({ type: 'text' })
  email!: string;

  @Property({ type: 'text', nullable: true })
  phone?: string;

  @Property({ type: 'text' })
  bankName!: string;

  @Property({ type: 'text' })
  title!: string;

  @Property({ type: 'text' })
  assetsUnderManagement!: string;

  @Property({ type: 'text', nullable: true })
  currentProvider?: string;

  @Property({ type: 'text' })
  timeline!: string;

  @Property({ type: 'text' })
  preferredTime!: string;

  @Property({ type: 'text', nullable: true })
  message?: string;

  @Property({ type: 'datetime', nullable: true })
  scheduledAt?: Date;

  @Property({ type: 'datetime', nullable: true })
  completedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
