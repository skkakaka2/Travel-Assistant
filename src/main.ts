import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 注册 cookie 插件
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'my-secret-key', // 用于签名 cookie
  });

  await app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('Travel Assistant API')
    .setDescription('Travel Assistant API 文档')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}`, '本地开发环境')
    .addServer(`http://127.0.0.1:${port}`, '本地开发环境 (127.0.0.1)')
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

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
