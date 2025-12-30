import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignMentorDto {
    @IsNotEmpty({ message: 'ID giảng viên không được để trống' })
    @IsInt({ message: 'ID giảng viên phải là số nguyên' })
    mentorId: number;
}