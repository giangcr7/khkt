import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common'; 
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { NotificationsService } from './notifications.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Sinh viên lấy danh sách thông báo của mình' })
  async getMyNotifications(@Request() req) {
    return this.notificationsService.getMyNotifications(req.user.userId || req.user.id);
  }

  // BỔ SUNG HÀM NÀY:
  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo là đã đọc' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(Number(id));
  }
}