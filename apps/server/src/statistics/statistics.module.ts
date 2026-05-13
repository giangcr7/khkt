import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService], // <-- Phải có dòng này để module khác dùng ké
})
export class StatisticsModule {}