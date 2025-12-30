import { Injectable } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // Hàm tìm user theo email (Dùng cho Auth)
    async findOneByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    // Hàm tìm user theo ID (Dùng cho Profile)
    async findOneById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }
    async findAllLecturers() {
        return this.prisma.user.findMany({
            where: {
                role: Role.LECTURER // Chỉ lấy ai có quyền LECTURER
            },
            select: { // Chỉ lấy thông tin cần thiết, giấu password đi
                id: true,
                fullName: true,
                email: true,
                avatar: true
            }
        });
    }
}