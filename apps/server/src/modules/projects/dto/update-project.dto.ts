// File: src/modules/projects/dto/update-project.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
    // Cho phép cập nhật link báo cáo (Không bắt buộc)
    @IsOptional()
    @IsString()
    reportUrl?: string;

    // Cho phép cập nhật link slide (Không bắt buộc)
    @IsOptional()
    @IsString()
    slideUrl?: string;
}