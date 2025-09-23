import { Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Vendor } from './vendor.entity';
import { DocumentAccessRequest } from './document-access-request.entity';

export enum ComplianceDocumentType {
  SECURITY_AUDIT = 'security-audit',
  SECURITY_CERTIFICATION = 'security-certification',
  REGULATORY_ASSESSMENT = 'regulatory-assessment',
  OPERATIONAL_DOCUMENTATION = 'operational-documentation',
  LEGAL_DOCUMENTATION = 'legal-documentation',
}

export enum ComplianceDocumentConfidentiality {
  PUBLIC = 'public',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential',
}

export enum ComplianceDocumentStatus {
  CURRENT = 'current',
  EXPIRING = 'expiring',
  EXPIRED = 'expired',
}

@Entity()
export class ComplianceDocument {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Vendor)
  vendor!: Vendor;

  @Property({ type: 'text' })
  title!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Enum({ items: () => ComplianceDocumentType })
  type!: ComplianceDocumentType;

  @Enum({ items: () => ComplianceDocumentConfidentiality })
  confidentiality!: ComplianceDocumentConfidentiality;

  @Enum({ items: () => ComplianceDocumentStatus })
  status!: ComplianceDocumentStatus;

  @Property({ type: 'datetime' })
  lastUpdated!: Date;

  @Property({ type: 'datetime', nullable: true })
  expiresAt?: Date;

  @Property({ type: 'text', nullable: true })
  size?: string;

  @Property({ type: 'text' })
  fileUrl!: string;

  @Property({ type: 'boolean', default: false })
  requiredApproval!: boolean;

  @Property({ type: 'int', default: 0 })
  downloadCount!: number;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;

  @OneToMany(() => DocumentAccessRequest, accessRequest => accessRequest.document)
  accessRequests?: DocumentAccessRequest[] = [];
}
