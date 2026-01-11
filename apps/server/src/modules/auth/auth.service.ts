import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common'; // <--- Thêm ForbiddenException
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // 1. Kiểm tra User (Đăng nhập)
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);

        if (user) {
            // --- CẬP NHẬT: Kiểm tra trạng thái khóa ---
            if (!user.isActive) {
                throw new ForbiddenException('Tài khoản đã bị khóa. Vui lòng liên hệ Admin!');
            }
            // ------------------------------------------

            // Kiểm tra mật khẩu
            if (await bcrypt.compare(pass, user.password)) {
                const { password, ...result } = user;
                return result;
            }
        }
        return null;
    }

    // 2. Đăng nhập
    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                avatar: user.avatar // Trả thêm avatar nếu có
            }
        };
    }

    async register(dto: RegisterDto) {
        const existingUser = await this.usersService.findOneByEmail(dto.email);
        if (existingUser) {
            throw new BadRequestException('Email này đã được sử dụng');
        }

        // KHÔNG HASH mật khẩu ở đây nữa
        // Truyền thẳng password thô sang UsersService
        const newUser = await this.usersService.create({
            email: dto.email,
            password: dto.password, // Để UsersService.create xử lý hash
            fullName: dto.fullName,
            role: Role.STUDENT
        });

        return newUser;
    }
}