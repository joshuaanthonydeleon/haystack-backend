import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';
  // Configure comma-separated origins in CORS_ALLOWED_ORIGINS for production deployments.
  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  const defaultLocalOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];

  const allowlist = isProduction ? configuredOrigins : defaultLocalOrigins;

  app.enableCors({
    origin: (origin, callback) => {
      if (!isProduction) {
        callback(null, true);
        return;
      }

      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowlist.length === 0) {
        callback(new Error('CORS origin not configured for production environment.'));
        return;
      }

      if (allowlist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy.`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
