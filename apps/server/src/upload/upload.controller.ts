import { Controller, Post, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

// src/upload/upload.controller.ts
@Post()
@UseInterceptors(FileInterceptor('file'))
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Query('folder') folder: string // Frontend gửi lên: /upload?folder=posts
) {
  const url = await this.uploadService.save(file, folder);
  return { url };
}
}