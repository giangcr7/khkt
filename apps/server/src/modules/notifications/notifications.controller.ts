import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { NotificationsService } from './notifications.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Sinh viên lấy danh sách thông báo của mình' })
  async getMyNotifications(@Request() req) {
    return this.notificationsService.getMyNotifications(req.user.userId);
  }
}
