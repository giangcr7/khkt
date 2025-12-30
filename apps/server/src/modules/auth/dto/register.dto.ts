import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client'; // Import Role từ Prisma để check đúng quyền

export class RegisterDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string;
    @IsString()
    @IsNotEmpty({ message: 'Họ tên không được để trống' })
    fullName: string;
    @IsOptional()
    @IsEnum(Role, { message: 'Quyền (Role) không hợp lệ' })
    role?: Role;
}