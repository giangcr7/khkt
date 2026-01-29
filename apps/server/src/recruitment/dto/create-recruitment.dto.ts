// src/recruitment/dto/create-recruitment.dto.ts
import { IsString, IsArray, IsInt, Min } from 'class-validator';

export class CreateRecruitmentDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsInt()
  @Min(1)
  targetAmount: number;
}