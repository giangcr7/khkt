import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],        // <--- Bổ sung dòng này để dùng Database
  controllers: [UsersController], // <--- QUAN TRỌNG: Phải có dòng này API mới chạy
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }