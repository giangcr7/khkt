import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, Delete, Param, ParseIntPipe, UseGuards, Query, Patch, BadRequestException } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ResourceType } from '@prisma/client';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { UploadService } from 'src/upload/upload.service';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  // Tiêm (Inject) thêm UploadService vào constructor
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly uploadService: UploadService 
  ) { }

  // 1. Xem danh sách (CÔNG KHAI)
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
    // XOÁ diskStorage ĐI. Mặc định Multer sẽ lưu file vào Buffer (RAM) để stream lên Cloud
    limits: { fileSize: 20 * 1024 * 1024 } 
  }))
  @ApiConsumes('multipart/form-data')
  async create( // Nhớ thêm async vì gọi Cloudinary mất thời gian
    @Body() body: { title: string; type: ResourceType; link?: string; description?: string },
    @UploadedFile() file: Express.Multer.File
  ) {
    let finalUrl = body.link; // Mặc định là link video nếu có

    // Nếu có file tải lên, đẩy thẳng lên Cloudinary
    if (file) {
      finalUrl = await this.uploadService.save(file, 'resources'); 
    }

    if (!finalUrl) {
      throw new BadRequestException('Bạn phải upload file hoặc nhập link video!');
    }

    return this.resourcesService.create({
      title: body.title,
      type: body.type,
      description: body.description,
      fileUrl: finalUrl // Lúc này finalUrl là link https://res.cloudinary...
    });
  }

  // 3. Cập nhật tài liệu (Chỉ Admin)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 20 * 1024 * 1024 }
  }))
  async update( // Thêm async
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; type?: ResourceType; link?: string; description?: string },
    @UploadedFile() file: Express.Multer.File
  ) {
    let newUrl: string | undefined = body.link;

    // Nếu User có chọn file mới để upload
    if (file) {
      newUrl = await this.uploadService.save(file, 'resources'); // Đẩy lên mây
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