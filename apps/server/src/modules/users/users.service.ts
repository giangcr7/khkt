import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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
            orderBy: { id: 'asc' }
        });
    }

    async create(data: any) {
        // 1. Kiểm tra email trùng (Sửa lại gọi hàm findOneByEmail)
        const exists = await this.findOneByEmail(data.email);
        if (exists) throw new ConflictException('Email đã tồn tại!');

        // 2. Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 3. Tạo user
        return this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                fullName: data.fullName,
                role: data.role,
                isActive: data.isActive ?? true
            }
        });
    }

    async update(id: number, data: any) {
        // Nếu có gửi mật khẩu mới lên thì mã hóa
        if (data.password && data.password.trim() !== '') {
            data.password = await bcrypt.hash(data.password, 10);
        } else {
            delete data.password;
        }

        try {
            return await this.prisma.user.update({
                where: { id },
                data: data
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