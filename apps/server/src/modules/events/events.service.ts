import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.event.findMany({
            orderBy: { startDate: 'asc' },
        });
    }

    async create(dto: CreateEventDto) {
        // Dữ liệu từ JSON đã được class-validator đảm bảo kiểu dữ liệu
        return this.prisma.event.create({
            data: {
                ...dto,
                startDate: new Date(dto.startDate),
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                // Không cần String(...) === 'true' vì DTO đã ép kiểu Boolean
            },
        });
    }

    async update(id: number, dto: UpdateEventDto) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event) throw new NotFoundException('Không tìm thấy mốc thời gian này');

        return this.prisma.event.update({
            where: { id },
            data: {
                ...dto,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : undefined,
            },
        });
    }

    async remove(id: number) {
        await this.prisma.event.findUnique({ where: { id } }); // Đảm bảo tồn tại trước khi xóa
        return this.prisma.event.delete({ where: { id } });
    }
}