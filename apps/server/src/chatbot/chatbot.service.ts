@Injectable()
export class ChatbotService {
  constructor(private readonly httpService: HttpService) {}

  async getChatbotResponse(message: string): Promise<string> {
    try {
      // 1. Lấy URL từ biến môi trường, nếu không có thì mới dùng localhost để test máy
      const aiServerUrl = process.env.AI_SERVER_URL || 'http://127.0.0.1:5000';
      
      // 2. Gọi sang link động
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