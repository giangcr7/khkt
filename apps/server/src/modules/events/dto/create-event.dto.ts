import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, IsUrl } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề sự kiện không được để trống' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  @IsNotEmpty()
  startDate: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;

  // BƯỚC 2: Nhận URL chuỗi từ API Upload trả về
  @IsOptional()
  @IsUrl({}, { message: 'Đường dẫn file phải là một URL hợp lệ' })
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}