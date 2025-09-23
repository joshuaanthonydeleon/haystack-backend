import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Notification, User])],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
