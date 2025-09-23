import { ComplianceDocumentConfidentiality, ComplianceDocumentStatus, ComplianceDocumentType } from '../../entities/compliance-document.entity';

export class CreateComplianceDocumentDto {
  title!: string;
  description?: string;
  type!: ComplianceDocumentType;
  confidentiality!: ComplianceDocumentConfidentiality;
  status!: ComplianceDocumentStatus;
  lastUpdated!: Date;
  expiresAt?: Date;
  size?: string;
  fileUrl!: string;
  requiredApproval!: boolean;
}
