import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './user.entity';

export enum NotificationType {
  DEMO_REQUEST = 'demo_request',
  CLAIM_APPROVED = 'claim_approved',
  DOCUMENT_REQUEST = 'document_request',
  REVIEW_SUBMITTED = 'review_submitted',
}

@Entity()
export class Notification {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Enum({ items: () => NotificationType })
  type!: NotificationType;

  @Property({ type: 'text' })
  title!: string;

  @Property({ type: 'text' })
  message!: string;

  @Property({ type: 'boolean', default: false })
  isRead!: boolean;

  @Property({ type: 'text', nullable: true })
  actionUrl?: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
