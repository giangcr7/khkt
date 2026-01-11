import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    UseGuards, UseInterceptors, UploadedFile, ParseIntPipe
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { Public } from '../auth/decorators/public.decorator';
import { EventsService } from './events.service';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
    constructor(
        private readonly eventsService: EventsService,
        private readonly uploadService: UploadService,
    ) { }

    @Public()
    @Get()
    async findAll() {
        return this.eventsService.findAll();
    }

    @Post()
    @Roles(Role.ADMIN)
    @UseInterceptors(FileInterceptor('file')) // Phải khớp với key 'file' ở Frontend
    async create(
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File
    ) {
        let fileUrl: string | null = null;
        let fileName: string | null = null;

        if (file) {
            // UploadService xử lý buffer và trả về đường dẫn
            fileUrl = await this.uploadService.save(file);
            fileName = file.originalname;
            console.log('File đã upload thành công:', fileName, '->', fileUrl);
        }

        return this.eventsService.create({
            ...body,
            fileUrl,
            fileName,
        });
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File
    ) {
        const updateData = { ...body };

        if (file) {
            updateData.fileUrl = await this.uploadService.save(file);
            updateData.fileName = file.originalname;
        }

        return this.eventsService.update(id, updateData);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.remove(id);
    }
}