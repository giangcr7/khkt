import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiTags } from '@nestjs/swagger'; // Import
@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) { }

  // API: Lấy số liệu thống kê cho Dashboard/Trang chủ
  // GET http://localhost:3000/stats/dashboard
  @Get('dashboard')
  getDashboardStats() {
    return this.statsService.getDashboardStats();
  }
}