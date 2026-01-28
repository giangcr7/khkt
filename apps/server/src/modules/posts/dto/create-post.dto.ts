import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { PostType } from '@prisma/client';

export class CreatePostDto {
    @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    content?: string;

    // THAY ĐỔI: Thumbnail bây giờ bắt buộc phải là định dạng URL hợp lệ 
    // nhận được từ API /upload trước đó
    @IsOptional()
    @IsUrl({}, { message: 'Thumbnail phải là một đường dẫn URL hợp lệ' })
    thumbnail?: string;

    @IsOptional()
    @IsString()
    externalLink?: string;

    @IsNotEmpty({ message: 'Loại bài viết không được để trống' })
    @IsEnum(PostType, { message: 'Loại bài viết không hợp lệ' })
    type: PostType;

    // Bổ sung authorId để xác định người đăng (theo schema Prisma của bạn)
    @IsNotEmpty()
    authorId: number;
}