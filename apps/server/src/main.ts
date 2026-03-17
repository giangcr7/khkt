import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
  }));

  const config = new DocumentBuilder()
    .setTitle('Hệ thống Quản lý NCKH')
    .setDescription('Tài liệu API cho Website hỗ trợ NCKH')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 
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
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); 
bootstrap();
}