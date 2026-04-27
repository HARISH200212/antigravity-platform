import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.enableCors({
    origin: ['http://localhost:3000', /https:\/\/.*\.run\.app$/],
    credentials: true,
  });

  // Conditionally enable Swagger (avoid hard dependency if not installed)
  try {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('AntiGravity Technologies API')
      .setDescription('AGT-LEV-2026-04 Platform — REST + WebSocket')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .addTag('auth').addTag('experiments').addTag('hardware').addTag('telemetry')
      .addTag('safety').addTag('simulation').addTag('optimizer')
      .addTag('analytics').addTag('audit').addTag('notifications')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log('📖 Swagger UI: http://localhost:4000/api-docs');
  } catch {
    logger.warn('Swagger not available (run npm install @nestjs/swagger)');
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 AGT API → http://localhost:${port}`);
  logger.log(`⚡ WebSocket → ws://localhost:${port}/telemetry`);
}

bootstrap();
