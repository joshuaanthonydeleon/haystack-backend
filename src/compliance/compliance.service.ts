import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { ComplianceDocument } from '../entities/compliance-document.entity';
import { Vendor } from '../entities/vendor.entity';
import { CreateComplianceDocumentDto } from './dto/create-compliance-document.dto';
import { DocumentAccessRequest, DocumentAccessRequestStatus } from '../entities/document-access-request.entity';
import { RequestDocumentAccessDto } from './dto/request-document-access.dto';
import { User, UserRole } from '../entities/user.entity';
import { DecideDocumentAccessDto } from './dto/decide-document-access.dto';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(ComplianceDocument)
    private readonly documentRepository: EntityRepository<ComplianceDocument>,
    @InjectRepository(DocumentAccessRequest)
    private readonly accessRequestRepository: EntityRepository<DocumentAccessRequest>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: EntityRepository<Vendor>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  async listDocumentsForVendor(vendorId: number): Promise<ComplianceDocument[]> {
    return this.documentRepository.find({ vendor: vendorId }, {
      orderBy: { createdAt: 'DESC' },
    });
  }

  async createDocument(vendorId: number, dto: CreateComplianceDocumentDto): Promise<ComplianceDocument> {
    const vendor = await this.vendorRepository.findOne(vendorId);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const document = this.documentRepository.create({
      vendor,
      downloadCount: 0,
      ...dto,
    });

    await this.em.persistAndFlush(document);
    return document;
  }

  async requestAccess(userId: number, documentId: number, dto: RequestDocumentAccessDto): Promise<DocumentAccessRequest> {
    const [document, user] = await Promise.all([
      this.documentRepository.findOne(documentId, { populate: ['vendor'] }),
      this.userRepository.findOne(userId, { populate: ['vendor'] }),
    ]);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.VENDOR && (!user.vendor || user.vendor.id !== document.vendor.id)) {
      throw new ForbiddenException('Cannot request access to documents for another vendor');
    }

    const accessRequest = this.accessRequestRepository.create({
      document,
      user,
      justification: dto.justification,
      status: DocumentAccessRequestStatus.PENDING,
    });

    await this.em.persistAndFlush(accessRequest);
    return accessRequest;
  }

  async listAccessRequestsForVendor(currentUser: { userId: number; role: UserRole }): Promise<DocumentAccessRequest[]> {
    if (currentUser.role === UserRole.ADMIN) {
      return this.accessRequestRepository.find({}, {
        populate: ['document', 'document.vendor', 'user', 'approvedBy'],
        orderBy: { requestedAt: 'DESC' },
      });
    }

    if (currentUser.role === UserRole.VENDOR) {
      const user = await this.userRepository.findOne(currentUser.userId, { populate: ['vendor'] });
      if (!user?.vendor) {
        throw new ForbiddenException('Vendor account not linked');
      }

      return this.accessRequestRepository.find({ document: { vendor: user.vendor.id } }, {
        populate: ['document', 'document.vendor', 'user', 'approvedBy'],
        orderBy: { requestedAt: 'DESC' },
      });
    }

    throw new ForbiddenException('Access denied');
  }

  async decideAccessRequest(currentUser: { userId: number; role: UserRole }, requestId: number, dto: DecideDocumentAccessDto): Promise<DocumentAccessRequest> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can decide access requests');
    }

    const accessRequest = await this.accessRequestRepository.findOne(requestId, {
      populate: ['approvedBy'],
    });

    if (!accessRequest) {
      throw new NotFoundException('Access request not found');
    }

    const approver = await this.userRepository.findOne(currentUser.userId);
    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    if (dto.approve) {
      accessRequest.status = DocumentAccessRequestStatus.APPROVED;
      accessRequest.approvedAt = new Date();
      accessRequest.approvedBy = approver;
      accessRequest.rejectedAt = undefined;
      accessRequest.rejectionReason = undefined;
    } else {
      accessRequest.status = DocumentAccessRequestStatus.REJECTED;
      accessRequest.rejectedAt = new Date();
      accessRequest.rejectionReason = dto.rejectionReason;
      accessRequest.approvedAt = undefined;
      accessRequest.approvedBy = undefined;
    }

    await this.em.flush();
    return accessRequest;
  }
}
