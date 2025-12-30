import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectStatusDto {
    @IsNotEmpty()
    @IsEnum(ProjectStatus)
    status: ProjectStatus;

    @IsOptional()
    @IsString()
    feedback?: string;

    // Thêm trường điểm số (0 -> 10)
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    score?: number;
}