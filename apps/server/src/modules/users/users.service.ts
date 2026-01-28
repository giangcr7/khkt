import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // --- SỬA TÊN HÀM TẠI ĐÂY (findOne -> findOneByEmail) ---
    async findOneByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    // Hàm này giữ nguyên logic destructuring đã sửa ở bước trước
    async findOneById(id: number) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) return null;

        // Tách password ra khỏi object trả về để bảo mật
        const { password, ...result } = user;
        return result;
    }

    async findAllLecturers() {
        return this.prisma.user.findMany({
            where: { role: 'LECTURER', isActive: true },
            select: { id: true, fullName: true, email: true }
        });
    }

async findAll() {
    return this.prisma.user.findMany({
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
            avatar: true, // Trả thêm avatar để hiển thị trên bảng
            createdAt: true,
        },
        orderBy: { id: 'asc' }
    });
}
async create(dto: CreateUserDto) {
        const exists = await this.findOneByEmail(dto.email);
        if (exists) throw new ConflictException('Email đã tồn tại!');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.user.create({
            data: {
                ...dto, // Tự động lấy avatar URL nếu có trong JSON
                password: hashedPassword,
                isActive: dto.isActive ?? true
            }
        });
    }

    // CẬP NHẬT: Nhận URL chuỗi từ Cloudinary thông qua DTO
    async update(id: number, dto: UpdateUserDto) {
        if (dto.password && dto.password.trim() !== '') {
            dto.password = await bcrypt.hash(dto.password, 10);
        } else {
            delete dto.password;
        }

        try {
            return await this.prisma.user.update({
                where: { id },
                data: {
                    ...dto // Bao gồm trường avatar: string
                }
            });
        } catch (error) {
            throw new NotFoundException('Người dùng không tồn tại');
        }
    }

    async remove(id: number) {
        try {
            return await this.prisma.user.delete({ where: { id } });
        } catch (error) {
            throw new NotFoundException('Không thể xóa người dùng này');
        }
    }
}