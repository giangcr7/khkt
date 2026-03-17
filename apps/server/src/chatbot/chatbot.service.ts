import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatbotService {
  constructor(private readonly httpService: HttpService) {}

  async getChatbotResponse(message: string): Promise<string> {
    try {
      // Gọi sang server Python (đang chạy ở cổng 5000)
      const response = await firstValueFrom(
        this.httpService.post('http://127.0.0.1:5000/api/chat', {
          message: message,
        }),
      );
      
      return response.data.reply;
    } catch (error) {
        console.error('Lỗi khi gọi AI Server:', error.message);
        throw new HttpException(
          'Hệ thống AI đang bận hoặc chưa bật Python Server.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
    }
  }
}