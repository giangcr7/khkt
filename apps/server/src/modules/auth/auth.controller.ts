import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto'; // Import DTO
import { ApiTags } from '@nestjs/swagger';
@ApiTags('auth')

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // 1. API Đăng ký (Cần Public để ai cũng tạo được tài khoản)
    @Public()
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    // 2. API Đăng nhập
    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    // 3. API Test Token (Bảo mật)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}