import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Hàm dùng chung để tạo thông báo cho bất kỳ user nào
  async createNotification(userId: number, title: string, content: string, link?: string) {
    return this.prisma.notification.create({
      data: { userId, title, content, link },
    });
  }

  // Lấy thông báo cá nhân cho Sinh viên
  async getMyNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
