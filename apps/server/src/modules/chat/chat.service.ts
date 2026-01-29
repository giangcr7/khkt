import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Lấy hoặc tạo phòng chat giữa 2 người dùng
  async getOrCreateRoom(user1Id: number, user2Id: number) {
    // 1. Kiểm tra đầu vào
    if (!user2Id || user1Id === user2Id) {
      throw new BadRequestException('ID người nhận không hợp lệ hoặc bạn đang tự chat với chính mình');
    }

    // 2. Kiểm tra người nhận có tồn tại trong DB không để tránh lỗi P2003
    const receiver = await this.prisma.user.findUnique({ where: { id: user2Id } });
    if (!receiver) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${user2Id}`);
    }

    // Sắp xếp ID để đảm bảo tính duy nhất theo @@unique([user1Id, user2Id])
    const [idA, idB] = [user1Id, user2Id].sort((a, b) => a - b);

    // Định nghĩa cấu trúc include dùng chung
    const commonInclude = {
      messages: {
        include: { 
          sender: { select: { id: true, fullName: true, avatar: true } } 
        },
        orderBy: { createdAt: 'asc' as const },
        take: 50,
      },
      user1: { select: { id: true, fullName: true, avatar: true } },
      user2: { select: { id: true, fullName: true, avatar: true } },
    };

    // 3. Tìm phòng chat đã tồn tại
    let room = await this.prisma.chatRoom.findUnique({
      where: {
        user1Id_user2Id: { user1Id: idA, user2Id: idB },
      },
      include: commonInclude,
    });

    // 4. Nếu không có, tạo mới
    if (!room) {
      room = await this.prisma.chatRoom.create({
        data: { user1Id: idA, user2Id: idB },
        include: commonInclude,
      });
    }
    return room;
  }

  // Lấy danh sách các phòng chat của một sinh viên
  async getMyRooms(userId: number) {
    return this.prisma.chatRoom.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, fullName: true, avatar: true } },
        user2: { select: { id: true, fullName: true, avatar: true } },
        messages: {
          include: { sender: { select: { fullName: true } } }, // Thêm include sender để biết ai gửi tin cuối
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}