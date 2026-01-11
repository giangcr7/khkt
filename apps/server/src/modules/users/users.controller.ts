import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // 1. API: Lấy danh sách Giảng viên (Public/Student/Lecturer đều dùng được để chọn GV)
    @Get('lecturers')
    getLecturers() {
        return this.usersService.findAllLecturers();
    }

    // 2. API: Xem thông tin cá nhân
    @Get('profile')
    getProfile(@Request() req) {
        return this.usersService.findOneById(req.user.userId);
    }

    // --- CÁC API DÀNH RIÊNG CHO ADMIN ---

    // 3. Lấy danh sách TẤT CẢ người dùng
    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.usersService.findAll();
    }

    // 4. Tạo người dùng mới
    @Post()
    @Roles(Role.ADMIN)
    create(@Body() body: any) {
        return this.usersService.create(body);
    }

    // 5. Cập nhật thông tin (Đổi tên, Vai trò, Khóa tài khoản, Đổi pass...)
    @Patch(':id')
    @Roles(Role.ADMIN)
    update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
        return this.usersService.update(id, body);
    }

    // 6. Xóa người dùng
    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}