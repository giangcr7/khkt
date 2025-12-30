import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard) // Bắt buộc phải đăng nhập mới gọi được API User
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // 1. API: Lấy danh sách Giảng viên (Để chọn hoặc phân công)
    // URL: GET http://localhost:3000/users/lecturers
    // LƯU Ý: Phải đặt hàm này LÊN TRÊN các hàm khác để tránh lỗi định tuyến
    @Get('lecturers')
    getLecturers() {
        return this.usersService.findAllLecturers();
    }

    // 2. API: Xem thông tin cá nhân (Profile)
    // URL: GET http://localhost:3000/users/profile
    @Get('profile')
    getProfile(@Request() req) {
        // req.user lấy từ Token (chứa userId)
        return this.usersService.findOneById(req.user.userId);
    }
}