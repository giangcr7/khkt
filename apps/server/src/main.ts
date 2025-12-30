import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Kích hoạt Validation (Kiểm tra dữ liệu đầu vào theo DTO)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động loại bỏ các trường thừa không có trong DTO
  }));

  // 2. Cấu hình Swagger (Tài liệu API)
  const config = new DocumentBuilder()
    .setTitle('Hệ thống Quản lý NCKH')
    .setDescription('Tài liệu API cho Website hỗ trợ NCKH')
    .setVersion('1.0')
    .addBearerAuth() // Thêm nút nhập Token để test các API bảo mật
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Đường dẫn truy cập: http://localhost:3000/api

  // 3. Kích hoạt CORS (Để Frontend React/Vue/NextJS gọi được API)
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();