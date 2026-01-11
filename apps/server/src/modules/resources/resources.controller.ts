import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, Delete, Param, ParseIntPipe, UseGuards, Query, Patch } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ResourceType } from '@prisma/client';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator'; // Đảm bảo đã có decorator này

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) { }

  // 1. Xem danh sách (CÔNG KHAI - Cho phép trang chủ truy cập)
  @Public()
  @Get()
  findAll(@Query('type') type?: ResourceType) {
    return this.resourcesService.findAll(type);
  }

  // 2. Upload File hoặc Lưu Link (Chỉ Admin)
  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `resource-${uniqueSuffix}${ext}`);
      },
    }),
    limits: { fileSize: 20 * 1024 * 1024 } // Tăng lên 20MB cho tài liệu/video nhỏ
  }))
  @ApiConsumes('multipart/form-data')
  create(
    @Body() body: { title: string; type: ResourceType; link?: string; description?: string },
    @UploadedFile() file: Express.Multer.File
  ) {
    const finalUrl = file ? `/uploads/${file.filename}` : body.link;

    if (!finalUrl) {
      throw new Error('Bạn phải upload file hoặc nhập link video!');
    }

    return this.resourcesService.create({
      title: body.title,
      type: body.type,
      description: body.description,
      fileUrl: finalUrl
    });
  }

  // 3. Cập nhật tài liệu (Chỉ Admin)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `update-res-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; type?: ResourceType; link?: string; description?: string },
    @UploadedFile() file: Express.Multer.File
  ) {
    let newUrl: string | undefined = undefined;
    if (file) {
      newUrl = `/uploads/${file.filename}`;
    } else if (body.link) {
      newUrl = body.link;
    }

    return this.resourcesService.update(id, {
      title: body.title,
      type: body.type,
      description: body.description,
      fileUrl: newUrl
    });
  }

  // 4. Xóa tài liệu (Chỉ Admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.remove(id);
  }
}