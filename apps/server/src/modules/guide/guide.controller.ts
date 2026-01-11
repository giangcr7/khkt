import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { GuideService } from './guide.service';

@Controller('guides')
export class GuideController {
    constructor(private readonly guideService: GuideService) { }

    @Get('research')
    async getGuide() {
        return this.guideService.getGuide();
    }

    @Post('research')
    // Bạn nên thêm Guard kiểm tra quyền ADMIN tại đây
    async updateGuide(@Body() body: any) {
        return this.guideService.updateGuide(body);
    }
}