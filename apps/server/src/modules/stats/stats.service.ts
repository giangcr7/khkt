import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, ProjectStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) { }

  async getDashboardStats() {
    // Chạy song song các lệnh đếm để tối ưu tốc độ
    const [totalProjects, completedProjects, totalStudents, totalLecturers, totalEvents] = await Promise.all([
      // 1. Tổng số đề tài
      this.prisma.project.count(),

      // 2. Số đề tài đã hoàn thành
      this.prisma.project.count({
        where: { status: ProjectStatus.COMPLETED }
      }),

      // 3. Số sinh viên tham gia
      this.prisma.user.count({
        where: { role: Role.STUDENT }
      }),

      // 4. Số giảng viên hướng dẫn
      this.prisma.user.count({
        where: { role: Role.LECTURER }
      }),

      // 5. Số sự kiện/hội thảo sắp tới
      this.prisma.event.count()
    ]);

    return {
      totalProjects,
      completedProjects,
      totalStudents,
      totalLecturers,
      totalEvents
    };
  }
}