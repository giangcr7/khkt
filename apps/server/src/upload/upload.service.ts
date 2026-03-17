import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
export class UploadService {
  async save(file: Express.Multer.File, folderName: string = 'general'): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { 
          folder: `tlu_research/${folderName}`,
          resource_type: 'auto',
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse | undefined) => {
          if (error) return reject(error);
          if (result && result.secure_url) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Cloudinary upload failed: Result is undefined'));
          }
        },
      );
            upload.end(file.buffer);
    });
  }
}