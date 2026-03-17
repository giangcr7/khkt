import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
  }));

  // 2. Swagger
  const config = new DocumentBuilder()
    .setTitle('Hệ thống Quản lý NCKH')
    .setDescription('Tài liệu API cho Website hỗ trợ NCKH')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  // 3. CORS
  app.enableCors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000',
      /\.vercel\.app$/, 
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
    credentials: true,
  });

  // 4. Port & Listen
  const port = process.env.PORT || 10000; 
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
}
bootstrap();