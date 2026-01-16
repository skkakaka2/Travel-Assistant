import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import Multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedAdmin } from './seeds/seed';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import { config } from 'dotenv';
import { resolve, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import 'reflect-metadata';

// Load environment variables
// Priority: .env.local > .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 注册 cookie 插件
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'my-secret-key', // 用于签名 cookie
  });
  await app.register(Multipart, {
    limits: {
      fileSize: 1024 * 1024 * 10,
    },
  });
  app.setGlobalPrefix('api');

  // 配置静态文件服务，用于访问上传的图片
  const uploadsDir = join(process.cwd(), 'uploads');
  // 确保 uploads 目录存在
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/', // 访问路径前缀: http://localhost:3000/uploads/xxx.jpg
    decorateReply: false, // 避免与其他静态服务冲突
  });

  await app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Travel Assistant API')
    .setDescription('Travel Assistant API Documentation')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}`, 'Local Development')
    .addServer(`http://127.0.0.1:${port}`, 'Local Development (127.0.0.1)')
    .addTag('app')
    .addTag('trip')
    .addCookieAuth('token', {
      type: 'http',
      in: 'Cookie',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/apijson', (req, res) => {
    httpAdapter.reply(res, document, 200);
  });

  const dataSource = app.get(DataSource);

  await seedAdmin(dataSource);

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
