import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostType } from '@prisma/client';

export class CreatePostDto {
    @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    content?: string; // Nội dung bài viết (HTML hoặc Text)

    @IsOptional()
    @IsString()
    thumbnail?: string; // Link ảnh bìa

    @IsNotEmpty()
    @IsEnum(PostType, { message: 'Loại bài viết không hợp lệ (NEWS, GUIDE, ANNOUNCEMENT)' })
    type: PostType;
}