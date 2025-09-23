import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: EntityRepository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  async listForUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({ user: userId }, {
      orderBy: { createdAt: 'DESC' },
    });
  }

  async markAsRead(userId: number, notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne(notificationId, { populate: ['user'] });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user.id !== userId) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    await this.em.flush();
    return notification;
  }

  async createNotification(userId: number, data: Pick<Notification, 'title' | 'message' | 'type' | 'actionUrl'>): Promise<Notification> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = this.notificationRepository.create({
      user,
      ...data,
      isRead: false,
    });

    await this.em.persistAndFlush(notification);
    return notification;
  }
}
