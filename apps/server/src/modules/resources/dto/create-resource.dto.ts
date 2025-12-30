import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class CreateResourceDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsUrl({}, { message: 'Link tài liệu phải là URL hợp lệ' })
    fileUrl: string; // Link Google Drive hoặc link file

    @IsNotEmpty()
    @IsEnum(ResourceType)
    type: ResourceType; // TEMPLATE (Biểu mẫu), GUIDE (Hướng dẫn), VIDEO
}