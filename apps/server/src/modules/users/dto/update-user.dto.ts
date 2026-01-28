import { IsOptional, IsString, IsUrl, IsEmail, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    password?: string;

    // NHẬN URL TỪ BƯỚC 1: Cloudinary upload
    @IsOptional()
    @IsUrl({}, { message: 'Ảnh đại diện phải là một đường dẫn URL hợp lệ' })
    avatar?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}