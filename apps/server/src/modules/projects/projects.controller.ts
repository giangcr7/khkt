import { Controller, Get, Post, Body, UseGuards, Request, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateProjectDto } from './dto/create-project.dto';

// 1. Thêm các Import mới
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignMentorDto } from './dto/assign-mentor.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Projects')
@Controller('projects')
// 2. Kích hoạt thêm RolesGuard để kiểm tra quyền
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    // API: Đăng ký đề tài
    // POST http://localhost:3000/projects
    @Post()
    @Roles(Role.STUDENT) // 3. Chỉ cho phép SINH VIÊN gọi API này
    create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
        // req.user được giải mã từ Token (chứa userId, role)
        return this.projectsService.create(req.user.userId, createProjectDto);
    }

    // API: Xem danh sách
    // GET http://localhost:3000/projects
    @Get()
    // Không cần @Roles -> Ai đăng nhập rồi cũng xem được (Logic lọc nằm ở Service)
    findAll(@Request() req) {
        return this.projectsService.findAll(req.user.role, req.user.userId);
    }// 3. API Duyệt đề tài (Chỉ GIẢNG VIÊN & ADMIN)
    // PATCH http://localhost:3000/projects/:id/status
    @Patch(':id/status')
    @Roles(Role.LECTURER, Role.ADMIN) // <--- Chốt chặn quan trọng
    updateStatus(
        @Param('id', ParseIntPipe) id: number, // Lấy ID từ URL
        @Body() dto: UpdateProjectStatusDto    // Lấy status, feedback từ Body
    ) {
        return this.projectsService.updateStatus(id, dto);
    }
    // 4. API: Sinh viên nộp báo cáo
    // URL: PATCH http://localhost:3000/projects/:id
    @Patch(':id')
    @Roles(Role.STUDENT) // <--- QUAN TRỌNG: Chỉ Sinh viên mới gọi được
    update(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
        @Body() updateProjectDto: UpdateProjectDto
    ) {
        // req.user.userId lấy từ Token để đảm bảo tính bảo mật
        return this.projectsService.update(id, req.user.userId, updateProjectDto);
    }
    // 6. API: Phân công GV hướng dẫn (Chỉ ADMIN)
    // PATCH http://localhost:3000/projects/:id/assign
    @Patch(':id/assign')
    @Roles(Role.ADMIN) // <--- Chỉ ADMIN mới được phân công
    assignMentor(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignMentorDto
    ) {
        return this.projectsService.assignMentor(id, dto);
    }
    // 7. API: Xem đề tài mình hướng dẫn
    // GET http://localhost:3000/projects/managed
    @Get('managed')
    @Roles(Role.LECTURER) // Chỉ Giảng viên mới gọi được
    getManagedProjects(@Request() req) {
        // req.user.userId chính là ID của giảng viên đang đăng nhập
        return this.projectsService.findByMentor(req.user.userId);
    }
}