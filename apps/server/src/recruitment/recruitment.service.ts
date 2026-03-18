import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecruitmentDto } from './dto/create-recruitment.dto';
import { RecruitmentStatus } from '@prisma/client';

@Injectable()
export class RecruitmentService {
  constructor(private prisma: PrismaService) {}

  // 1. Đăng tin: Luôn mặc định là OPEN
  async create(authorId: number, dto: CreateRecruitmentDto) {
    return this.prisma.recruitment.create({
      data: { 
        title: dto.title,
        content: dto.content,
        skills: dto.skills || [],
        targetAmount: dto.targetAmount, 
        authorId: authorId,
        status: RecruitmentStatus.OPEN, 
      },
    });
  }

  // 2. Lấy danh sách tin đang OPEN (Dùng cho Dashboard & Tìm kiếm)
async findAll(skillFilter?: string[]) {
  return this.prisma.recruitment.findMany({
    where: {
      status: RecruitmentStatus.OPEN, 
      ...(skillFilter?.length ? { skills: { hasSome: skillFilter } } : {}),
    },
    include: {
      author: { select: { id: true, fullName: true, avatar: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

  // 3. Đóng tin tuyển dụng (Thay vì xóa)
  async closeRecruitment(id: number, userId: number) {
    const recruitment = await this.prisma.recruitment.findUnique({ 
      where: { id } 
    });

    if (!recruitment) throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    if (recruitment.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền đóng tin này');
    }

    return this.prisma.recruitment.update({
      where: { id },
      data: { status: RecruitmentStatus.CLOSED }, // Chuyển sang trạng thái Đóng
    });
  }

  // 4. Lấy chi tiết 1 tin
async findOne(id: number) {
  const recruitment = await this.prisma.recruitment.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, fullName: true, avatar: true, email: true }
      }
    }
  });

  if (!recruitment) throw new NotFoundException('Không tìm thấy tin');
    return recruitment; 
}

  // 5. Chấp nhận thành viên
  async acceptMember(applicationId: number) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.application.update({
        where: { id: applicationId },
        data: { status: 'ACCEPTED' },
        include: { recruitment: true },
      });

      await tx.notification.create({
        data: {
          userId: application.userId,
          title: 'Yêu cầu gia nhập nhóm được chấp nhận',
          content: `Bạn đã chính thức gia nhập đội cho tin tuyển dụng: ${application.recruitment.title}`,
          link: '/student/my-project',
        }
      });

      return application;
    });
  }
}