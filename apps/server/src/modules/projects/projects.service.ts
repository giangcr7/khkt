import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, ProjectStatus } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignMentorDto } from './dto/assign-mentor.dto';
import { NotificationsService } from '../notifications/notifications.service'; 

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService 
    ) { }

    async create(userId: number, dto: CreateProjectDto) {
        const activeProject = await this.prisma.project.findFirst({
            where: {
                studentId: userId,
                status: {
                    in: [ProjectStatus.PENDING, ProjectStatus.APPROVED, ProjectStatus.IN_PROGRESS]
                }
            }
        });

        if (activeProject) {
            throw new BadRequestException('Bạn đang có một đề tài đang thực hiện. Vui lòng hoàn thành trước khi đăng ký mới.');
        }

        return this.prisma.project.create({
            data: {
                name: dto.name,
                description: dto.description,
                status: ProjectStatus.PENDING,
                progress: 0,
                student: { connect: { id: userId } },
                topic: { connect: { id: dto.topicId } },
                mentor: dto.mentorId ? { connect: { id: dto.mentorId } } : undefined
            },
            include: {
                topic: true,
                mentor: { select: { fullName: true } }
            }
        });
    }
    async findAllForAdmin() {
        return this.prisma.project.findMany({
            include: {
                student: { select: { id: true, fullName: true, email: true } },
                mentor: { select: { id: true, fullName: true, email: true, avatar: true } },
                topic: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // 3. CHUNG: Xem danh sách đề tài theo Role
    async findAll(role: string, userId: number) {
        if (role === Role.ADMIN) return this.findAllForAdmin();
        if (role === Role.LECTURER) return this.findByMentor(userId);

        return this.prisma.project.findMany({
            where: { studentId: userId },
            include: { mentor: true, topic: true }
        });
    }

    // 4. CHUNG: Xem chi tiết 1 đề tài
    async findOne(id: number) {
        const project = await this.prisma.project.findUnique({
            where: { id: id },
            include: {
                student: { select: { fullName: true, email: true, id: true } },
                mentor: { select: { id: true, fullName: true, email: true, avatar: true } },
                topic: { select: { id: true, name: true } },
                progressLogs: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!project) throw new NotFoundException('Không tìm thấy đề tài');
        return project;
    }

    // 5. GIẢNG VIÊN: Duyệt đề tài hoặc Chấm điểm 
    async updateStatus(id: number, dto: UpdateProjectStatusDto) {
        let newProgress: number | undefined = undefined;
        if (dto.status === ProjectStatus.APPROVED) newProgress = 10;
        if (dto.status === ProjectStatus.COMPLETED) newProgress = 100;
        if (dto.status === ProjectStatus.REJECTED) newProgress = 0;

        const project = await this.prisma.project.update({
            where: { id: id },
            data: {
                status: dto.status,
                feedback: dto.feedback,
                score: dto.score,
                progress: newProgress ?? undefined,
            },
        });

        await this.notificationsService.createNotification(
            project.studentId,
            'Cập nhật trạng thái đề tài',
            `Đề tài "${project.name}" đã được chuyển sang trạng thái: ${dto.status}`,
            '/student/my-project'
        );

        return project;
    }

    // 6. ADMIN: Phân công lại Giảng viên 
    async assignMentor(projectId: number, dto: AssignMentorDto) {
        const project = await this.prisma.project.update({
            where: { id: projectId },
            data: { mentorId: dto.mentorId },
        });

        // Thông báo cho sinh viên về giảng viên mới
        await this.notificationsService.createNotification(
            project.studentId,
            'Phân công giảng viên hướng dẫn',
            `Bạn đã được phân công Giảng viên hướng dẫn mới cho đề tài: ${project.name}`,
            '/student/my-project'
        );

        return project;
    }
    async createTopic(data: { name: string; description?: string }) {
        return this.prisma.topic.create({
            data: {
                name: data.name,
            },
        });
    }
    async updateTopic(id: number, data: { name?: string; description?: string }) {
        const topic = await this.prisma.topic.findUnique({ where: { id } });
        if (!topic) {
            throw new NotFoundException(`Không tìm thấy chủ đề với ID ${id}`);
        }

        return this.prisma.topic.update({
            where: { id },
            data: {
                name: data.name,
            },
        });
    }
    // Hàm Xóa
    async deleteTopic(id: number) {
        return this.prisma.topic.delete({
            where: { id },
        });
    }
    // 7. SINH VIÊN: Chỉnh sửa thông tin
    async updateInfo(projectId: number, userId: number, dto: any) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new NotFoundException('Không tìm thấy đề tài');
        if (project.studentId !== userId) throw new ForbiddenException('Không có quyền');
        if (project.status !== ProjectStatus.PENDING) {
            throw new BadRequestException('Chỉ có thể sửa khi đề tài đang chờ duyệt');
        }

        return this.prisma.project.update({
            where: { id: projectId },
            data: {
                name: dto.name,
                description: dto.description,
                topic: { connect: { id: dto.topicId } },
                mentor: dto.mentorId ? { connect: { id: dto.mentorId } } : { disconnect: true }
            }
        });
    }

    // 8. SINH VIÊN: Thêm nhật ký tiến độ
    async addProgress(projectId: number, data: any) {
        const percentValue = parseInt(data.percent);
        await this.prisma.project.update({
            where: { id: projectId },
            data: { progress: percentValue }
        });

        return this.prisma.projectProgress.create({
            data: {
                projectId: projectId,
                title: data.title,
                content: data.content,
                percent: percentValue,
                fileUrl: data.fileUrl,
                fileName: data.fileName
            }
        });
    }

    // 9. GIẢNG VIÊN: Phản hồi báo cáo tiến độ 
    async addProgressFeedback(progressId: number, feedback: string) {
        const progress = await this.prisma.projectProgress.update({
            where: { id: progressId },
            data: { feedback },
            include: { project: true }
        });

        // Thông báo sinh viên có nhận xét mới
        await this.notificationsService.createNotification(
            progress.project.studentId,
            'Phản hồi tiến độ mới',
            `Giảng viên hướng dẫn vừa nhận xét báo cáo: "${progress.title}"`,
            '/student/my-project'
        );

        return progress;
    }

    // 10. GIẢNG VIÊN: Xem đề tài mình phụ trách
    async findByMentor(mentorId: number) {
        return this.prisma.project.findMany({
            where: { mentorId: mentorId },
            include: {
                student: { select: { id: true, fullName: true, email: true, avatar: true } },
                topic: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // 11. CÔNG KHAI: Thống kê và danh sách trang chủ
    async getPublicStats() {
        const [totalProjects, totalLecturers, completedProjects, totalTopics] = await Promise.all([
            this.prisma.project.count(),
            this.prisma.user.count({ where: { role: 'LECTURER' } }),
            this.prisma.project.count({ where: { status: 'COMPLETED' } }),
            this.prisma.topic.count(),
        ]);
        return { totalProjects, totalLecturers, completedProjects, totalTopics };
    }

    async findAllPublic() {
        return this.prisma.project.findMany({
            where: { status: { in: ['APPROVED', 'IN_PROGRESS', 'COMPLETED'] } },
            select: {
                id: true,
                name: true,
                status: true,
                progress: true,
                createdAt: true,
                topic: { select: { name: true } },
                mentor: { select: { fullName: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 6
        });
    }

    // 12. TIỆN ÍCH
    async getTopics() {
        return this.prisma.topic.findMany({ orderBy: { name: 'asc' } });
    }

    async getLecturers() {
        return this.prisma.user.findMany({
            where: { role: Role.LECTURER, isActive: true },
            select: { id: true, fullName: true, email: true, avatar: true },
            orderBy: { fullName: 'asc' }
        });
    }

    async remove(projectId: number, userId: number) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new NotFoundException('Không tìm thấy đề tài');
        if (project.studentId !== userId) throw new ForbiddenException('Không có quyền');
        if (project.status !== ProjectStatus.PENDING) {
            throw new BadRequestException('Không thể xóa đề tài đã được duyệt');
        }
        return this.prisma.project.delete({ where: { id: projectId } });
    }
}