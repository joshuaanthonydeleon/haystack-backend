import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { DemoRequest, DemoRequestStatus } from '../entities/demo-request.entity';
import { Vendor } from '../entities/vendor.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateDemoRequestDto } from './dto/create-demo-request.dto';
import { UpdateDemoRequestStatusDto } from './dto/update-demo-request-status.dto';

@Injectable()
export class DemoRequestService {
  constructor(
    @InjectRepository(DemoRequest)
    private readonly demoRequestRepository: EntityRepository<DemoRequest>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: EntityRepository<Vendor>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  async create(requesterId: number, dto: CreateDemoRequestDto): Promise<DemoRequest> {
    const vendor = await this.vendorRepository.findOne(dto.vendorId);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const requester = await this.userRepository.findOne(requesterId);
    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    const demoRequest = new DemoRequest();
    demoRequest.vendor = vendor;
    demoRequest.requester = requester;
    demoRequest.firstName = dto.firstName;
    demoRequest.lastName = dto.lastName;
    demoRequest.email = dto.email;
    demoRequest.phone = dto.phone;
    demoRequest.bankName = dto.bankName;
    demoRequest.title = dto.title;
    demoRequest.assetsUnderManagement = dto.assetsUnderManagement;
    demoRequest.currentProvider = dto.currentProvider;
    demoRequest.timeline = dto.timeline;
    demoRequest.preferredTime = dto.preferredTime;
    demoRequest.message = dto.message;
    demoRequest.status = dto.status ?? DemoRequestStatus.PENDING;
    demoRequest.scheduledAt = dto.scheduledAt;
    demoRequest.completedAt = dto.completedAt;

    await this.em.persistAndFlush(demoRequest);
    return demoRequest;
  }

  private async findUserWithVendor(userId: number): Promise<User | null> {
    return this.userRepository.findOne(userId, { populate: ['vendor'] });
  }

  async listForUser(user: { userId: number; role: UserRole }, vendorId?: number): Promise<DemoRequest[]> {
    if (user.role === UserRole.ADMIN) {
      return this.findAll(vendorId);
    }

    if (user.role === UserRole.VENDOR) {
      const userEntity = await this.findUserWithVendor(user.userId);
      if (!userEntity?.vendor) {
        throw new ForbiddenException('Vendor account not linked');
      }

      const requestedVendorId = vendorId ?? userEntity.vendor.id;
      if (requestedVendorId !== userEntity.vendor.id) {
        throw new ForbiddenException('Cannot access demo requests for another vendor');
      }

      return this.findAll(userEntity.vendor.id);
    }

    throw new ForbiddenException('Access denied');
  }

  private async findAll(vendorId?: number): Promise<DemoRequest[]> {
    const where = vendorId ? { vendor: vendorId } : {};
    return this.demoRequestRepository.find(where, {
      populate: ['vendor', 'requester'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async ensureCanAccess(requestId: number, user: { userId: number; role: UserRole }): Promise<DemoRequest> {
    const demoRequest = await this.demoRequestRepository.findOne(requestId, {
      populate: ['vendor', 'requester', 'vendor.users'],
    });

    if (!demoRequest) {
      throw new NotFoundException('Demo request not found');
    }

    if (user.role === UserRole.VENDOR) {
      const vendorUserIds = demoRequest.vendor.users?.map((u) => u.id) ?? [];
      if (!vendorUserIds.includes(user.userId)) {
        throw new ForbiddenException('Access denied');
      }
    }

    if (user.role === UserRole.BANK && demoRequest.requester.id !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    return demoRequest;
  }

  async updateStatus(requestId: number, dto: UpdateDemoRequestStatusDto): Promise<DemoRequest> {
    const demoRequest = await this.demoRequestRepository.findOne(requestId);
    if (!demoRequest) {
      throw new NotFoundException('Demo request not found');
    }

    if (dto.status === DemoRequestStatus.SCHEDULED && !dto.scheduledAt) {
      throw new BadRequestException('scheduledAt is required when scheduling a demo');
    }

    demoRequest.status = dto.status;
    demoRequest.scheduledAt = dto.scheduledAt;
    demoRequest.completedAt = dto.completedAt;

    await this.em.flush();
    return demoRequest;
  }
}
