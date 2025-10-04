import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { DemoRequest, DemoRequestStatus } from '../entities/demo-request.entity';
import { Vendor } from '../entities/vendor.entity';
import { User, UserRole } from '../entities/user.entity';
import { UpdateDemoRequestStatusDto } from './dto/update-demo-request-status.dto';
import { CreateDemoRequestDto } from './validations/demo-request.validations';

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
  ) { }

  async create(vendorId: number, dto: CreateDemoRequestDto): Promise<DemoRequest> {
    const vendor = await this.vendorRepository.findOne(vendorId);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const requester = await this.userRepository.findOne(dto.userId);
    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    const demoRequest = new DemoRequest();
    demoRequest.vendor = vendor;
    demoRequest.requester = requester;
    demoRequest.timeline = dto.timeline;
    demoRequest.preferredTime = dto.preferredTime;
    demoRequest.message = dto.message;


    await this.em.persistAndFlush(demoRequest);
    return demoRequest;
  }

  async listForUser(user: { userId: number }, vendorId?: number): Promise<DemoRequest[]> {
    const userEntity = await this.userRepository.findOneOrFail({ id: user.userId, vendor: vendorId }, { populate: ['demoRequests'] })
    return userEntity!.demoRequests ?? [];
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
