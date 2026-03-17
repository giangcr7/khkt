import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard'; 
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service'; 

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService 
  ) {}

  @Post('rooms')
  @ApiOperation({ summary: 'Lấy hoặc tạo phòng chat giữa 2 sinh viên' })
  async getOrCreateRoom(@Request() req, @Body('receiverId') receiverId: number) {
    const userId = req.user.id || req.user.userId;
    return this.chatService.getOrCreateRoom(userId, Number(receiverId));
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Lấy danh sách các cuộc hội thoại của tôi' })
  async getMyRooms(@Request() req) {
    const userId = req.user.id || req.user.userId;
    return this.chatService.getMyRooms(userId);
  }

  @Get('rooms/:id')
  @ApiOperation({ summary: 'Lấy lịch sử tin nhắn của một phòng chat' })
  async getRoomDetail(@Param('id') id: string) {
    return this.prisma.chatRoom.findUnique({
      where: { id: +id },
      include: {
        messages: {
          include: { sender: { select: { id: true, fullName: true, avatar: true } } },
          orderBy: { createdAt: 'asc' }
        },
        user1: { select: { id: true, fullName: true, avatar: true } },
        user2: { select: { id: true, fullName: true, avatar: true } }
      }
    });
  }
}