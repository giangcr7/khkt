import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatbotService {
  constructor(private readonly httpService: HttpService) {}

  async getChatbotResponse(message: string): Promise<string> {
    try {
      // Lấy URL AI Server từ biến môi trường trên Render
      const aiServerUrl = process.env.AI_SERVER_URL || 'http://127.0.0.1:5000';
      
      const response = await firstValueFrom(
        this.httpService.post(`${aiServerUrl}/api/chat`, {
          message: message,
        }),
      );
      
      return response.data.reply;
    } catch (error) {
        console.error('Lỗi khi gọi AI Server:', error.message);
        throw new HttpException(
          'Hệ thống AI đang bận hoặc chưa cấu hình link Server.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
    }
  }
}