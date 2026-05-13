import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // API lưu lịch sử tính Cỡ mẫu
  @Post('sample-size')
  async saveSample(
    @Req() req: any,
    @Body() body: { type: string; inputs: any; result: number }
  ) {
    // Nếu hệ thống đã có Auth Guard, lấy req.user.id. Tạm thời để 1 nếu sếp test.
    const userId = req.user?.id || 1; 
    return this.statisticsService.saveSampleCalculation(userId, body.type, body.inputs, body.result);
  }

  // API lấy danh sách lịch sử của sinh viên
  @Get('history')
  async getHistory(@Req() req: any) {
    const userId = req.user?.id || 1;
    return this.statisticsService.getHistory(userId);
  }
}