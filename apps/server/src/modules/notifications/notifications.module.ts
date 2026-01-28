import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Để dùng được this.prisma
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // Xuất ra để ProjectService có thể gọi
})
export class NotificationsModule {}
