import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { join } from 'node:path';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.setGlobalPrefix('api');
  }

  app.enableCors({
    origin: isProduction
      ? process.env.FRONTEND_URL || false
      : 'http://localhost:4200',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (isProduction) {
    const frontendPath = join(
      process.cwd(),
      '..',
      'frontend',
      'dist',
      'frontend',
      'browser',
    );

    app.use(express.static(frontendPath));
  }

  await app.init();

  if (isProduction) {
    const frontendPath = join(
      process.cwd(),
      '..',
      'frontend',
      'dist',
      'frontend',
      'browser',
    );

    app.use((req: Request, res: Response, next: NextFunction) => {
      const isApiRoute =
        req.path === '/api' || req.path.startsWith('/api/');

      if (req.method === 'GET' && !isApiRoute && req.accepts('html')) {
        return res.sendFile(join(frontendPath, 'index.html'));
      }

      next();
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
