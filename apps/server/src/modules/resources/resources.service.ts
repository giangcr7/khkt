import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResourceType } from '@prisma/client';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) { }

  // 1. Thêm tài liệu mới
  async create(data: { title: string; type: ResourceType; fileUrl: string; description?: string }) {
    return this.prisma.resource.create({
      data: {
        title: data.title,
        type: data.type,
        fileUrl: data.fileUrl,
        description: data.description, 
      }
    });
  }

  // 2. Lấy danh sách 
  async findAll(type?: ResourceType) {
    return this.prisma.resource.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' }
    });
  }

  // 3. Lấy chi tiết 1 tài liệu
  async findOne(id: number) {
    return this.prisma.resource.findUnique({ where: { id } });
  }

  // 4. Xóa tài liệu
  async remove(id: number) {
    return this.prisma.resource.delete({ where: { id } });
  }

  // 5. Sửa tài liệu
  async update(id: number, data: { title?: string; type?: ResourceType; fileUrl?: string; description?: string }) {
    return this.prisma.resource.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        description: data.description, 
        ...(data.fileUrl && { fileUrl: data.fileUrl }),
      }
    });
  }
}