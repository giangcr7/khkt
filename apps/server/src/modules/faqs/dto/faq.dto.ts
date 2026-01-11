import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFaqDto {
    @IsNotEmpty({ message: 'Câu hỏi không được để trống' })
    @IsString()
    question: string;

    @IsNotEmpty({ message: 'Câu trả lời không được để trống' })
    @IsString()
    answer: string;
}

export class UpdateFaqDto extends CreateFaqDto { }