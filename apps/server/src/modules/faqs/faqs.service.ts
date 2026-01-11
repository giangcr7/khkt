import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Injectable()
export class FaqsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.faq.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(createFaqDto: CreateFaqDto) {
        return this.prisma.faq.create({
            data: createFaqDto,
        });
    }

    async update(id: number, updateFaqDto: UpdateFaqDto) {
        return this.prisma.faq.update({
            where: { id },
            data: updateFaqDto,
        });
    }

    async remove(id: number) {
        return this.prisma.faq.delete({
            where: { id },
        });
    }
}