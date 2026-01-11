import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PostsModule } from './modules/posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { StatsModule } from './modules/stats/stats.module';
import { EventsModule } from './modules/events/events.module';
import { FaqsModule } from './modules/faqs/faqs.module';
// --- 1. IMPORT GUIDEMODULE ---
import { GuideModule } from './modules/guide/guide.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Cấu hình thư mục Public để xem ảnh/tài liệu
    ServeStaticModule.forRoot({
      // Nếu folder 'uploads' nằm ngang hàng với 'src', dùng path này:
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    PrismaModule,
    AuthModule,

    // Các tính năng chính
    UsersModule,
    ProjectsModule,
    PostsModule,
    ResourcesModule,
    StatsModule,
    EventsModule,
    FaqsModule,
    GuideModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }