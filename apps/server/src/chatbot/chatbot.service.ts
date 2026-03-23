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
        this.httpService.post(
          `${aiServerUrl}/api/chat`, 
          {
            message: message,
          },
          {
            // 👇 THÊM CÁI NÀY ĐỂ HUGGING FACE KHÔNG CHẶN REQUEST
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' 
            }
          }
        ),
      );
      
      return response.data.reply;
    } catch (error) {
        // 👇 IN CHI TIẾT LỖI RA LOG ĐỂ BẮT ĐÚNG BỆNH
        console.error('🔥 LỖI KHI GỌI AI SERVER:', error.response?.data || error.message || error);
        
        throw new HttpException(
          'Hệ thống AI đang bận hoặc chưa cấu hình link Server.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
    }
  }
}