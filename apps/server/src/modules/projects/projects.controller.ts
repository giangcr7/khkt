import {
    Controller, Get, Post, Body, UseGuards, Request, Patch,
    Param, ParseIntPipe, UseInterceptors, UploadedFile, Delete
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { AssignMentorDto } from './dto/assign-mentor.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly uploadService: UploadService
    ) { }

    // ==========================================
    // 1. PUBLIC ROUTES (Trang chủ & Khách)
    // ==========================================

    @Public()
    @Get('stats')
    getPublicStats() {
        return this.projectsService.getPublicStats();
    }

    @Public()
    @Get('topics')
    getTopics() {
        return this.projectsService.getTopics();
    }

    @Public()
    @Get('lecturers')
    getLecturers() {
        return this.projectsService.getLecturers();
    }

    @Public()
    @Get('public-list')
    getPublicList() {
        return this.projectsService.findAllPublic();
    }

    // ==========================================
    // 2. ADMIN ROUTES (Dành riêng cho Quản trị viên)
    // ==========================================

    @Get('admin/all')
    @Roles(Role.ADMIN) // Khớp với API gọi từ AdminProjectManagement.tsx
    findAllForAdmin() {
        return this.projectsService.findAllForAdmin();
    }

    @Patch(':id/assign')
    @Roles(Role.ADMIN) // Chức năng phân công GV cho đề tài
    assignMentor(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignMentorDto
    ) {
        return this.projectsService.assignMentor(id, dto);
    }

    // ==========================================
    // 3. LECTURER ROUTES (Dành cho Giảng viên)
    // ==========================================

    @Get('managed')
    @Roles(Role.LECTURER) // Lấy đề tài GV đang hướng dẫn
    getManagedProjects(@Request() req) {
        return this.projectsService.findByMentor(req.user.userId);
    }

    @Patch('progress/:progressId/feedback')
    @Roles(Role.LECTURER) // GV nhận xét tiến độ tuần
    addFeedback(
        @Param('progressId', ParseIntPipe) progressId: number,
        @Body() body: { feedback: string }
    ) {
        return this.projectsService.addProgressFeedback(progressId, body.feedback);
    }

    @Patch(':id/status')
    @Roles(Role.LECTURER, Role.ADMIN) // Duyệt hoặc chấm điểm đề tài
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProjectStatusDto
    ) {
        return this.projectsService.updateStatus(id, dto);
    }

    // ==========================================
    // 4. COMMON & STUDENT ROUTES
    // ==========================================

    @Get()
    findAll(@Request() req) {
        return this.projectsService.findAll(req.user.role, req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.findOne(id);
    }

    @Post()
    @Roles(Role.STUDENT)
    create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(req.user.userId, createProjectDto);
    }

    @Patch(':id/info')
    @Roles(Role.STUDENT)
    updateInfo(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
        @Body() body: { name: string; description: string; topicId: number; mentorId: number }
    ) {
        return this.projectsService.updateInfo(id, req.user.userId, body);
    }

    @Post(':id/progress')
    @UseInterceptors(FileInterceptor('file'))
    async addProgress(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File
    ) {
        const fileUrl = file ? await this.uploadService.save(file) : null;
        return this.projectsService.addProgress(id, { ...body, fileUrl, fileName: file?.originalname });
    }

    @Delete(':id')
    @Roles(Role.STUDENT)
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.projectsService.remove(id, req.user.userId);
    }
}