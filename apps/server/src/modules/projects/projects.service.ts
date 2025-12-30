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

    // 1. Sinh viên đăng ký đề tài mới
    async create(userId: number, dto: CreateProjectDto) {
        const existingProject = await this.prisma.project.findFirst({
            where: {
                studentId: userId,
                status: {
                    in: [ProjectStatus.PENDING, ProjectStatus.APPROVED]
                }
            }
        });
        if (existingProject) {
            throw new BadRequestException('Bạn đang có một đề tài chưa hoàn thành. Không thể đăng ký thêm.');
        }

        return this.prisma.project.create({
            data: {
                ...dto,
                studentId: userId,
                status: ProjectStatus.PENDING,
                progress: 0
            },
        });
    }

    // 2. Xem danh sách đề tài
    async findAll(userRole: Role, userId: number) {
        if (userRole === Role.STUDENT) {
            return this.prisma.project.findMany({
                where: { studentId: userId },
                include: { mentor: { select: { fullName: true } } },
                orderBy: { createdAt: 'desc' }
            });
        }

        return this.prisma.project.findMany({
            include: {
                student: { select: { fullName: true, email: true } },
                mentor: { select: { fullName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // 3. Giảng viên duyệt/chấm điểm
    async updateStatus(id: number, dto: UpdateProjectStatusDto) {
        // SỬA LỖI 1: Khai báo rõ kiểu dữ liệu là number hoặc undefined
        let newProgress: number | undefined = undefined;

        // Logic 1: Nếu duyệt bắt đầu -> 10%
        if (dto.status === ProjectStatus.APPROVED) {
            newProgress = 10;
        }

        // Logic 2: Nếu chấm điểm Hoàn thành -> 100%
        if (dto.status === ProjectStatus.COMPLETED) {
            newProgress = 100;
        }

        // Logic 3: Nếu bị từ chối -> 0%
        // SỬA LỖI 2: Xóa CANCELED vì trong Database không có
        if (dto.status === ProjectStatus.REJECTED) {
            newProgress = 0;
        }

        return this.prisma.project.update({
            where: { id: id },
            data: {
                status: dto.status,
                feedback: dto.feedback,
                score: dto.score,
                progress: newProgress,
            },
            include: {
                student: { select: { email: true, fullName: true } }
            }
        });
    }

    // 4. Sinh viên nộp báo cáo (Cập nhật link)
    async update(projectId: number, userId: number, dto: UpdateProjectDto) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            throw new NotFoundException('Không tìm thấy đề tài này');
        }

        if (project.studentId !== userId) {
            throw new ForbiddenException('Bạn không có quyền chỉnh sửa đề tài của người khác');
        }

        return this.prisma.project.update({
            where: { id: projectId },
            data: {
                reportUrl: dto.reportUrl,
                slideUrl: dto.slideUrl,
                progress: (dto.reportUrl && dto.slideUrl) ? 80 : undefined
            }
        });
    }

    // 5. Xem chi tiết 1 đề tài
    async findOne(id: number) {
        const project = await this.prisma.project.findUnique({
            where: { id: id },
            include: {
                student: { select: { fullName: true, email: true } },
                mentor: { select: { fullName: true } }
            }
        });

        if (!project) {
            throw new NotFoundException('Không tìm thấy đề tài');
        }
        return project;
    }
    // 6. Phân công Giảng viên hướng dẫn (ADMIN dùng)
    async assignMentor(projectId: number, dto: AssignMentorDto) {
        // 1. Kiểm tra đề tài có tồn tại không
        const project = await this.prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new NotFoundException('Không tìm thấy đề tài');
        }

        // 2. Kiểm tra Giảng viên có tồn tại và đúng là LECTURER không
        const mentor = await this.prisma.user.findUnique({
            where: { id: dto.mentorId }
        });

        if (!mentor) {
            throw new NotFoundException('Không tìm thấy giảng viên này');
        }

        if (mentor.role !== Role.LECTURER) {
            throw new BadRequestException('Người được phân công không phải là Giảng viên (LECTURER)');
        }

        // 3. Cập nhật vào Database
        return this.prisma.project.update({
            where: { id: projectId },
            data: {
                mentorId: dto.mentorId
            },
            include: {
                mentor: { select: { fullName: true, email: true } }, // Trả về thông tin GV vừa gán
                student: { select: { fullName: true } }
            }
        });
    }
    // 7. Xem danh sách đề tài do mình hướng dẫn (Dành cho GV)
    async findByMentor(mentorId: number) {
        return this.prisma.project.findMany({
            where: {
                mentorId: mentorId // Lọc theo ID giảng viên
            },
            include: {
                student: { // Lấy kèm thông tin sinh viên để GV biết ai với ai
                    select: { id: true, fullName: true, email: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
