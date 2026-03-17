import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { PostType } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  // 1. Tạo bài viết mới 
async create(userId: number, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        ...dto,
        authorId: userId, 
      },
    });
  }
  // 2. Lấy danh sách bài viết 
  async findAll(type?: PostType) {
    return this.prisma.post.findMany({
      where: type ? { type } : undefined, 
      orderBy: { createdAt: 'desc' },     
      include: {
        author: { select: { fullName: true } } 
      }
    });
  }

  // 3. Xem chi tiết 1 bài
  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { fullName: true, email: true } }
      }
    });

    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    return post;
  }

  // 4. Cập nhật bài viết
async update(id: number, dto: UpdatePostDto) {
    await this.findOne(id); 
    return this.prisma.post.update({
      where: { id },
      data: dto, 
    });
  }

  // 5. Xóa bài viết
  async remove(id: number) {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}