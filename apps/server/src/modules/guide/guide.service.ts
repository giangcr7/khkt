import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GuideService {
    constructor(private prisma: PrismaService) { }

    // Lấy dữ liệu cẩm nang (Sử dụng findFirst vì chỉ có 1 bản ghi hướng dẫn chung)
    async getGuide() {
        return this.prisma.researchGuide.findFirst({
            where: { isActive: true },
        });
    }

    // Cập nhật hoặc Tạo mới (Upsert logic)
    async updateGuide(data: any) {
        const existing = await this.prisma.researchGuide.findFirst();

        // Tạo đối tượng dữ liệu an toàn
        const guideData = {
            mainTitle: data.mainTitle,
            subTitle: data.subTitle || "",
            steps: data.steps || [],  // Nếu không có, gán mảng rỗng
            tools: data.tools || [],  // SỬA LỖI: Luôn cung cấp giá trị tools
            skills: data.skills || [], // SỬA LỖI: Luôn cung cấp giá trị skills
            isActive: true
        };

        if (existing) {
            return this.prisma.researchGuide.update({
                where: { id: existing.id },
                data: guideData,
            });
        }

        // Khi tạo mới, Prisma sẽ không còn báo thiếu trường 'tools' hay 'skills'
        return this.prisma.researchGuide.create({
            data: guideData,
        });
    }
}