import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, PostType } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger'; 

@ApiTags('Posts (News & Guides)') 
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  // 1. Tạo bài viết (Chỉ ADMIN hoặc LECTURER)
@Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.LECTURER)
  create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(req.user.userId, createPostDto);
  }
  @Get()
  findAll(@Query('type') type?: PostType) {
    return this.postsService.findAll(type);
  }

  // 3. Xem chi tiết 1 bài
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  // 4. Sửa bài viết (Chỉ ADMIN/LECTURER)
@Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.LECTURER)
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }
  // 5. Xóa bài viết (Chỉ ADMIN)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}