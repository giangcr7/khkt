import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostType } from '@prisma/client';

export class CreatePostDto {
    @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString() // Dùng IsString thay vì IsUrl để tránh lỗi với chuỗi rỗng hoặc link nội bộ
    thumbnail?: string;

    @IsOptional()
    @IsString()
    externalLink?: string;

    @IsNotEmpty({ message: 'Loại bài viết không được để trống' })
    @IsEnum(PostType, { message: 'Loại bài viết không hợp lệ' })
    type: PostType;

    // XOÁ authorId ở đây! 
    // Vì authorId lấy từ req.user trong Controller, không phải từ Body gửi lên.
}