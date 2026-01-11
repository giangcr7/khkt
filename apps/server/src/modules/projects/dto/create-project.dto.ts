import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    topicId: number;

    @IsNumber()
    @IsOptional() // Có thể để Optional nếu cho phép SV không chọn trước
    mentorId?: number;

    @IsString()
    @IsOptional()
    description?: string;
}