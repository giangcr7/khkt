import { 
    Controller, Get, Post, Patch, Delete, Body, 
    Param, ParseIntPipe, UseGuards, Request 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Users')
@ApiBearerAuth() 
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // 1. API: Xem thông tin cá nhân
    @Get('profile')
    @ApiOperation({ summary: 'Lấy thông tin tài khoản đang đăng nhập' })
    getProfile(@Request() req) {
        return this.usersService.findOneById(req.user.userId);
    }

    // 2. Lấy danh sách giảng viên
    @Public() 
    @Get('lecturers')
    @ApiOperation({ summary: 'Lấy danh sách giảng viên (Công khai)' })
    getLecturers() {
        return this.usersService.findAllLecturers();
    }

    // 3. Lấy toàn bộ danh sách người dùng (Chỉ Admin)
    @Get('all')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Admin quản lý toàn bộ người dùng' })
    findAll() {
        return this.usersService.findAll();
    }

    // 4. Tạo người dùng mới
    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Admin tạo tài khoản mới' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    // 5. Cập nhật thông tin người dùng
    @Patch(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Admin cập nhật thông tin người dùng' })
    update(
        @Param('id', ParseIntPipe) id: number, 
        @Body() updateUserDto: UpdateUserDto 
    ) {
        return this.usersService.update(id, updateUserDto);
    }

    // 6. Xóa người dùng
    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Admin xóa tài khoản' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}