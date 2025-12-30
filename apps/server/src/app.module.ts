import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PostsModule } from './modules/posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { StatsModule } from './modules/stats/stats.module';

@Module({
  imports: [
    // 1. Cấu hình biến môi trường (Global)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Database & Auth
    PrismaModule,
    AuthModule,

    // 3. Các tính năng chính
    UsersModule,
    ProjectsModule,
    PostsModule,
    ResourcesModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  // LƯU Ý: Đã bỏ APP_GUARD ở đây để tránh chặn API Tin tức (Public)
})
export class AppModule { }