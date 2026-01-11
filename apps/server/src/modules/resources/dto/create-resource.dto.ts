import { ResourceType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResourceDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsEnum(ResourceType)
    @IsNotEmpty()
    type: ResourceType;

    @IsString()
    @IsNotEmpty()
    fileUrl: string;

    @IsString()
    @IsOptional() // Cho phép để trống
    description?: string;
}