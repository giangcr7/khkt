import { Controller, Get, Post, Body, Query, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { CreateRecruitmentDto } from './dto/create-recruitment.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';

@ApiTags('recruitment')
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng tin tìm đồng đội (Mặc định trạng thái OPEN)' })
  create(@Request() req, @Body() dto: CreateRecruitmentDto) {
    const userId = req.user.userId || req.user.id;
    return this.recruitmentService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các tin đang mở (OPEN)' })
  search(@Query('skills') skills?: string) {
    const skillList = skills ? skills.split(',') : [];
    return this.recruitmentService.findAll(skillList);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một tin tuyển dụng' })
  findOne(@Param('id') id: string) {
    return this.recruitmentService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chủ tin đóng tuyển (Chuyển trạng thái sang CLOSED)' })
  delete(@Param('id') id: string, @Request() req) {
    const userId = req.user.id || req.user.userId;
    return this.recruitmentService.closeRecruitment(+id, userId);
  }
}