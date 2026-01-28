import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'; // Import type để TS hiểu

@Injectable()
export class UploadService {
  async save(file: Express.Multer.File, folderName: string = 'general'): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { 
          folder: `tlu_research/${folderName}`,
          resource_type: 'auto', // Cho phép upload cả PDF, Word, Ảnh...
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse | undefined) => {
          if (error) return reject(error);

          // SỬA LỖI TẠI ĐÂY: Đảm bảo result tồn tại trước khi lấy secure_url
          if (result && result.secure_url) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Cloudinary upload failed: Result is undefined'));
          }
        },
      );
      
      // Đẩy dữ liệu từ bộ nhớ đệm (buffer) vào luồng upload
      upload.end(file.buffer);
    });
  }
}