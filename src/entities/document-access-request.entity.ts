import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ComplianceDocument } from './compliance-document.entity';
import { User } from './user.entity';

export enum DocumentAccessRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class DocumentAccessRequest {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => ComplianceDocument)
  document!: ComplianceDocument;

  @ManyToOne(() => User)
  user!: User;

  @Enum({ items: () => DocumentAccessRequestStatus, default: DocumentAccessRequestStatus.PENDING })
  status!: DocumentAccessRequestStatus;

  @Property({ type: 'text', nullable: true })
  justification?: string;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  requestedAt?: Date;

  @Property({ type: 'datetime', nullable: true })
  approvedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  approvedBy?: User;

  @Property({ type: 'datetime', nullable: true })
  rejectedAt?: Date;

  @Property({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
