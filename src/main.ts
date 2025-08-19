import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全域驗證管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS 設定
  app.enableCors();

  // Swagger API 文件設定
  const config = new DocumentBuilder()
    .setTitle('首都圏通勤ポータル API')
    .setDescription('首都圏・通勤導向の一頁式入口のためのバックエンドAPI')
    .setVersion('1.0')
    .addTag('通勤検索', '通勤候補駅の検索機能')
    .addTag('イベント追跡', 'ユーザー行動の記録・分析機能')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'スムマチ API ドキュメント',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📖 API Documentation: http://localhost:${port}/docs`);
}
void bootstrap();
