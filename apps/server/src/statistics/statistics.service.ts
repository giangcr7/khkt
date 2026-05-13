import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  // Lưu và trả về kết quả tính cỡ mẫu
  async saveSampleCalculation(userId: number, type: string, inputs: any, result: number) {
    return this.prisma.analysisHistory.create({
      data: {
        userId,
        type: `SAMPLE_SIZE_${type.toUpperCase()}`,
        inputData: inputs,
        resultData: { minSampleSize: result },
      },
    });
  }

  // Lưu và trả về kết quả chạy hồi quy từ file Excel
  async saveRegressionAnalysis(userId: number, fileName: string, report: any) {
    return this.prisma.analysisHistory.create({
      data: {
        userId,
        type: 'LINEAR_REGRESSION',
        inputData: { fileName },
        resultData: report,
      },
    });
  }

  // Lấy lại lịch sử cho sinh viên xem
  async getHistory(userId: number) {
    return this.prisma.analysisHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}