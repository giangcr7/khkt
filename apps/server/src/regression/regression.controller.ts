import { Controller, Post, UploadedFile, UseInterceptors, Body, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegressionService } from './regression.service';
// import { StatisticsService } from './statistics.service'; // Mở comment dòng này nếu sếp muốn lưu kết quả vào DB

@Controller('regression')
export class RegressionController {
  constructor(
    private readonly regressionService: RegressionService,
    // private readonly statisticsService: StatisticsService // Mở comment nếu dùng DB
  ) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file')) // Nhận file từ Frontend gửi lên với key là 'file'
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body('dependentVar') yVar: string,
    @Body('independentVars') xVars: string,
    @Req() req: any
  ) {
    // 1. Tách chuỗi X1,X2 thành mảng ['X1', 'X2']
    const xList = xVars.split(',');

    // 2. Ném file Excel và các biến sang cho Service xử lý toán học (Cái file sếp vừa gửi đó)
    const analysisResult = this.regressionService.calculateLinearRegression(file.buffer, yVar, xList);

    // ==========================================
    // 3. (TÙY CHỌN) LƯU VÀO DATABASE LỊCH SỬ
    // Nếu sếp đã làm file StatisticsService ở bước trước, sếp có thể gọi hàm lưu DB tại đây:
    // const userId = req.user?.id || 1; // Lấy ID sinh viên đang đăng nhập
    // await this.statisticsService.saveRegressionAnalysis(userId, file.originalname, analysisResult);
    // ==========================================

    // 4. Trả kết quả dạng JSON về cho React (Frontend) vẽ bảng
    return analysisResult;
  }
}