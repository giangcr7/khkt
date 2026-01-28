import { IsEmail, IsNotEmpty, IsEnum, IsOptional, IsString, MinLength, IsUrl, IsBoolean } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @IsEnum(Role, { message: 'Vai trò không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng chọn vai trò' })
  role: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Trường nhận URL ảnh từ Cloudinary (Bước 1)
  @IsOptional()
  @IsUrl({}, { message: 'Đường dẫn ảnh đại diện không hợp lệ' })
  avatar?: string;
}