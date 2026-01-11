import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // Đảm bảo import PrismaModule
import { UploadService } from '../upload/upload.service'; // Import service này
@Module({
    imports: [PrismaModule], // Cần cái này để Service dùng được DB
    controllers: [ProjectsController],
    providers: [ProjectsService, UploadService],
})
export class ProjectsModule { }