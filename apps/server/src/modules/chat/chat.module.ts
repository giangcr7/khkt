import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller'; // 1. Import Controller vào đây
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ChatController], // 2. KHAI BÁO CONTROLLER TẠI ĐÂY
  providers: [ChatGateway, ChatService, PrismaService],
  exports: [ChatService],
})
export class ChatModule {}