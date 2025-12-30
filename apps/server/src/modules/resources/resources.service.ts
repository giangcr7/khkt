import { Injectable } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ResourceType } from '@prisma/client';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) { }

  // 1. Thêm tài liệu mới
  create(dto: CreateResourceDto) {
    return this.prisma.resource.create({
      data: dto
    });
  }

  // 2. Lấy danh sách (Có lọc theo loại)
  findAll(type?: ResourceType) {
    return this.prisma.resource.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.resource.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateResourceDto) {
    return this.prisma.resource.update({
      where: { id },
      data: dto
    });
  }

  remove(id: number) {
    return this.prisma.resource.delete({ where: { id } });
  }
}