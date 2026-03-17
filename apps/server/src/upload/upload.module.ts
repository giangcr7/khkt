import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryProvider } from './cloudinary.provider'; // Thêm dòng này

@Module({
  controllers: [UploadController],
  providers: [UploadService, CloudinaryProvider], // Thêm Provider vào đây
  exports: [UploadService, CloudinaryProvider], // Export cả hai
})
export class UploadModule {}