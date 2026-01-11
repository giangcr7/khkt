import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, ProjectStatus } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignMentorDto } from './dto/assign-mentor.dto';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    // 1. SINH VIÊN: Đăng ký đề tài mới
    async create(userId: number, dto: CreateProjectDto) {
        // Kiểm tra xem sinh viên có đề tài nào đang dở dang không
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
                // mentorId có thể null nếu sinh viên chưa chọn
                mentor: dto.mentorId ? { connect: { id: dto.mentorId } } : undefined
            },
            include: {
                topic: true,
                mentor: { select: { fullName: true } }
            }
        });
    }

    // 2. ADMIN: Lấy tất cả đề tài (Dùng cho AdminProjectManagement)
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

    // 3. CHUNG: Xem danh sách đề tài (Phân quyền theo Role)
    async findAll(role: string, userId: number) {
        if (role === Role.ADMIN) {
            return this.findAllForAdmin();
        }

        if (role === Role.LECTURER) {
            return this.findByMentor(userId);
        }

        // Sinh viên: Chỉ xem đề tài của chính mình
        return this.prisma.project.findMany({
            where: { studentId: userId },
            include: { mentor: true, topic: true }
        });
    }

    // 4. CHUNG: Xem chi tiết 1 đề tài (Trang Timeline/Chi tiết)
    async findOne(id: number) {
        const project = await this.prisma.project.findUnique({
            where: { id: id },
            include: {
                student: { select: { fullName: true, email: true, id: true } },
                mentor: { select: { id: true, fullName: true, email: true, avatar: true } },
                topic: { select: { id: true, name: true } },
                progressLogs: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!project) throw new NotFoundException('Không tìm thấy đề tài');
        return project;
    }

    // 5. GIẢNG VIÊN: Duyệt đề tài hoặc Chấm điểm kết thúc
    async updateStatus(id: number, dto: UpdateProjectStatusDto) {
        let newProgress: number | undefined = undefined;

        // Cập nhật tiến độ dựa trên trạng thái mới
        if (dto.status === ProjectStatus.APPROVED) newProgress = 10;
        if (dto.status === ProjectStatus.COMPLETED) newProgress = 100;
        if (dto.status === ProjectStatus.REJECTED) newProgress = 0;

        return this.prisma.project.update({
            where: { id: id },
            data: {
                status: dto.status,
                feedback: dto.feedback,
                score: dto.score,
                progress: newProgress ?? undefined,
            },
            include: {
                student: { select: { email: true, fullName: true } }
            }
        });
    }

    // 6. ADMIN: Phân công lại Giảng viên
    async assignMentor(projectId: number, dto: AssignMentorDto) {
        return this.prisma.project.update({
            where: { id: projectId },
            data: { mentorId: dto.mentorId },
            include: {
                mentor: { select: { fullName: true, email: true } },
                student: { select: { fullName: true } }
            }
        });
    }

    // 7. SINH VIÊN: Chỉnh sửa thông tin (Khi PENDING)
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

    // 8. SINH VIÊN: Thêm nhật ký tiến độ hàng tuần
    async addProgress(projectId: number, data: any) {
        const percentValue = parseInt(data.percent);

        // 1. Cập nhật tiến độ tổng của đề tài
        await this.prisma.project.update({
            where: { id: projectId },
            data: { progress: percentValue }
        });

        // 2. Lưu nhật ký tiến độ vào bảng ProjectProgress
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
        return this.prisma.projectProgress.update({
            where: { id: progressId },
            data: { feedback }
        });
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

    // 12. TIỆN ÍCH: Lấy danh mục cho Frontend
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