import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResourceType } from '@prisma/client';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) { }

  // 1. Thêm tài liệu mới
  // ✅ Cập nhật: Thêm description vào tham số đầu vào
  async create(data: { title: string; type: ResourceType; fileUrl: string; description?: string }) {
    return this.prisma.resource.create({
      data: {
        title: data.title,
        type: data.type,
        fileUrl: data.fileUrl,
        description: data.description, // ✅ Lưu mô tả vào DB
      }
    });
  }

  // 2. Lấy danh sách (Có hỗ trợ lọc theo loại)
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
  // ✅ Cập nhật: Thêm description vào tham số data
  async update(id: number, data: { title?: string; type?: ResourceType; fileUrl?: string; description?: string }) {
    return this.prisma.resource.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        description: data.description, // ✅ Cập nhật mô tả mới
        // Chỉ cập nhật fileUrl nếu có dữ liệu mới (không bị undefined)
        ...(data.fileUrl && { fileUrl: data.fileUrl }),
      }
    });
  }
}