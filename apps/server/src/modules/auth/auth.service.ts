import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client'; // <--- 1. BỔ SUNG IMPORT NÀY

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // 1. Kiểm tra User
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    // 2. Đăng nhập
    async login(user: any) {
        // Payload chứa thông tin quan trọng để phân quyền sau này
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    // 3. Đăng ký (Đã vá lỗi bảo mật)
    async register(dto: RegisterDto) {
        const existingUser = await this.usersService.findOneByEmail(dto.email);
        if (existingUser) {
            throw new BadRequestException('Email này đã được sử dụng');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const newUser = await this.usersService.create({
            email: dto.email,
            password: hashedPassword,
            fullName: dto.fullName,
            role: Role.STUDENT // <--- 2. SỬA LẠI: Dùng Enum 'Role' viết hoa
        });

        const { password, ...result } = newUser;
        return result;
    }
}