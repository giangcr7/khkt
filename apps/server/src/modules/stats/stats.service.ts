import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) { }

  async getDashboardStats() {
    const [
      totalStudents,
      totalLecturers,
      totalProjects,
      totalResources,
      pendingProjects,
      completedProjects,
      rejectedProjects,
      topicsData,
      recentProjects,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.user.count({ where: { role: Role.LECTURER } }),
      this.prisma.project.count(),
      this.prisma.resource.count(),
      this.prisma.project.count({ where: { status: 'PENDING' } }),
      this.prisma.project.count({ where: { status: 'COMPLETED' } }),
      this.prisma.project.count({ where: { status: 'REJECTED' } }),
      this.prisma.topic.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { projects: true },
          },
        },
      }),
      // Lấy 5 hoạt động đăng ký đề tài gần nhất để hiển thị Nhật ký
      this.prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { fullName: true } },
        },
      }),
    ]);

    const recentActivities = recentProjects.map(p => ({
      id: p.id,
      text: `Sinh viên ${p.student?.fullName || 'Ẩn danh'} đã đăng ký đề tài: ${p.name}`,
      time: this.formatRelativeTime(p.createdAt),
    }));

    return {
      users: {
        student: totalStudents,
        lecturer: totalLecturers,
      },
      projects: {
        total: totalProjects,
        pending: pendingProjects,
        completed: completedProjects,
        rejected: rejectedProjects,
        inProgress: totalProjects - pendingProjects - completedProjects - rejectedProjects,
      },
      resources: totalResources,
      topics: topicsData, 
      recentActivities: recentActivities,
    };
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  }
}