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
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { ChatModule } from './modules/chat/chat.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { StatisticsModule } from './statistics/statistics.module';
import { RegressionModule } from './regression/regression.module';
import { FileProxyController } from './file-proxy.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    PostsModule,
    ResourcesModule,
    StatsModule,
    EventsModule,
    FaqsModule,
    NotificationsModule,
    RecruitmentModule,
    ChatModule,
    ChatbotModule,
    StatisticsModule,
    RegressionModule,
  ],
  controllers: [AppController, FileProxyController],
  providers: [AppService],
})
export class AppModule {}
