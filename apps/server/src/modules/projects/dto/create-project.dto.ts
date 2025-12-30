import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateProjectDto {
    // Validate: Tên đề tài bắt buộc phải có
    @IsNotEmpty({ message: 'Tên đề tài không được để trống' })
    name: string;

    // Validate: Lĩnh vực nghiên cứu bắt buộc (CNTT, Kinh tế, Cơ khí...)
    @IsNotEmpty({ message: 'Lĩnh vực nghiên cứu là bắt buộc' })
    topic: string;

    // Validate: Mô tả có thể để trống (Optional)
    @IsOptional()
    @IsString()
    description?: string;
}