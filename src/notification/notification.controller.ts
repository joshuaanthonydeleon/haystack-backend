import { BadRequestException, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async list(@Req() req: any) {
    return this.notificationService.listForUser(req.user.userId);
  }

  @Patch(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (Number.isNaN(parsedId)) {
      throw new BadRequestException('Invalid notificationId');
    }
    return this.notificationService.markAsRead(req.user.userId, parsedId);
  }
}
