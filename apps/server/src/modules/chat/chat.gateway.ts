import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*' }, // Cấu hình cho phép Frontend kết nối
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Tham gia vào phòng chat
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomId: number, @ConnectedSocket() client: Socket) {
    client.join(`room_${roomId}`);
  }

  // Xử lý gửi tin nhắn real-time
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { roomId: number; senderId: number; content: string },
  ) {
    // 1. Lưu vào CSDL
    const newMessage = await this.prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        roomId: data.roomId,
      },
      include: {
        sender: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    // 2. Cập nhật thời gian phòng chat để đẩy lên đầu danh sách
    await this.prisma.chatRoom.update({
      where: { id: data.roomId },
      data: { updatedAt: new Date() },
    });

    // 3. Phát tin nhắn tới tất cả mọi người trong phòng
    this.server.to(`room_${data.roomId}`).emit('receiveMessage', newMessage);

    return newMessage;
  }
}