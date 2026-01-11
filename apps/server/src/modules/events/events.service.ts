import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.event.findMany({
            orderBy: { startDate: 'asc' },
        });
    }

    async create(data: any) {
        return this.prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                // Chuyển đổi 'true'/'false' (string) sang boolean
                isImportant: String(data.isImportant) === 'true',
                fileUrl: data.fileUrl,
                fileName: data.fileName,
            },
        });
    }

    async update(id: number, data: any) {
        return this.prisma.event.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
                // Ép kiểu boolean an toàn
                isImportant: data.isImportant !== undefined ? String(data.isImportant) === 'true' : undefined,
                fileUrl: data.fileUrl,
                fileName: data.fileName,
            },
        });
    }

    async remove(id: number) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event) throw new NotFoundException('Không tìm thấy mốc thời gian này');
        return this.prisma.event.delete({ where: { id } });
    }
}