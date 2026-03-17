import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  async askAI(@Body('message') message: string) {
    if (!message) {
      return { reply: "Bạn chưa nhập câu hỏi nào cả." };
    }
    
    // Đẩy câu hỏi xuống Service để gọi Python
    const reply = await this.chatbotService.getChatbotResponse(message);
    
    // Trả về cho ReactJS
    return { reply: reply };
  }
}