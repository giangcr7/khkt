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
    @IsString()
    thumbnail?: string;

    // THÊM DÒNG NÀY ĐỂ NHẬN LINK TỪ FRONTEND
    @IsOptional()
    @IsString()
    externalLink?: string;

    @IsNotEmpty()
    @IsEnum(PostType, { message: 'Loại bài viết không hợp lệ' })
    type: PostType;
}