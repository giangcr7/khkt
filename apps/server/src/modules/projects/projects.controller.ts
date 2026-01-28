import {
    Controller, Get, Post, Body, UseGuards, Request, Patch,
    Param, ParseIntPipe, Delete
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
// SỬA TẠI ĐÂY: Đảm bảo tên file là jwt-auth.guard (khớp với file bạn đã gửi)
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { AssignMentorDto } from './dto/assign-mentor.dto';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Projects')
@ApiBearerAuth() // Thêm để Swagger hiện nút khóa
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    // ==========================================
    // 1. PUBLIC ROUTES (Không cần Token)
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
    // 2. ADMIN ROUTES
    // ==========================================

    @Get('admin/all')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Admin lấy toàn bộ đề tài hệ thống' })
    findAllForAdmin() {
        return this.projectsService.findAllForAdmin();
    }

    @Patch(':id/assign')
    @Roles(Role.ADMIN)
    assignMentor(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignMentorDto
    ) {
        return this.projectsService.assignMentor(id, dto);
    }

    // ==========================================
    // 3. LECTURER ROUTES
    // ==========================================

    @Get('managed')
    @Roles(Role.LECTURER)
    getManagedProjects(@Request() req) {
        return this.projectsService.findByMentor(req.user.userId);
    }

    @Patch('progress/:progressId/feedback')
    @Roles(Role.LECTURER)
    addFeedback(
        @Param('progressId', ParseIntPipe) progressId: number,
        @Body() body: { feedback: string }
    ) {
        return this.projectsService.addProgressFeedback(progressId, body.feedback);
    }

    @Patch(':id/status')
    @Roles(Role.LECTURER, Role.ADMIN)
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProjectStatusDto
    ) {
        return this.projectsService.updateStatus(id, dto);
    }

    // ==========================================
    // 4. STUDENT & COMMON ROUTES
    // ==========================================

    @Get()
    findAll(@Request() req) {
        // req.user được gán từ JwtStrategy
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
    @Roles(Role.STUDENT)
    async addProgress(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { week: number; report: string; fileUrl?: string; fileName?: string }
    ) {
        return this.projectsService.addProgress(id, body);
    }

    @Delete(':id')
    @Roles(Role.STUDENT)
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.projectsService.remove(id, req.user.userId);
    }
}