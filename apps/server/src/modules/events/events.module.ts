import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [PrismaModule],
  controllers: [EventsController],
  providers: [EventsService, UploadService], // Nhớ thêm UploadService nếu dùng lưu file
})
export class EventsModule { }