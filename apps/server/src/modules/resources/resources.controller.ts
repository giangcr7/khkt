import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ResourceType } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) { }

  // 1. Thêm tài liệu (Chỉ Admin)
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.create(createResourceDto);
  }

  // 2. Xem danh sách (Public - Để sinh viên tải mẫu)
  // URL: GET /resources?type=TEMPLATE
  @Get()
  findAll(@Query('type') type?: ResourceType) {
    return this.resourcesService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.findOne(id);
  }

  // 3. Xóa tài liệu (Chỉ Admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.remove(id);
  }
}