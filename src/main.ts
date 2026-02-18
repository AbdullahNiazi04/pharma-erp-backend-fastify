import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SnakeToCamelInterceptor } from './common/interceptors/snake-to-camel.interceptor';

async function bootstrap() {
  // Create NestJS app with Fastify adapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://pharma-erp-frontend.vercel.app',
        // Dokpoly frontend domain – set FRONTEND_URL in Dokpoly env vars
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
      ];
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow any localhost or known production origins
      if (
        origin.startsWith('http://localhost') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.dokpoly.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global validation pipe with detailed logging
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      console.error('[VALIDATION ERROR]:', JSON.stringify(errors, null, 2));
      return new BadRequestException(errors);
    },
  }));

  // Global Interceptor for Snake Case to Camel Case
  app.useGlobalInterceptors(new SnakeToCamelInterceptor());

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('PharmaERP API')
    .setDescription('PharmaERP Backend API - Fastify + Prisma Edition')
    .setVersion('2.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 4001;

  // Debug Logger
  app.use((req: any, res: any, next: any) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    if (Object.keys(req.body || {}).length > 0) console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
  });

  // Health check endpoint – polled by Dokpoly to confirm the service is live
  app.getHttpAdapter().get('/health', (_req: any, reply: any) => {
    reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  await app.listen(port, '0.0.0.0');
  console.log('#################################################');
  console.log(`🚀 BACKEND V11 STARTED ON PORT ${port}`);
  console.log('#################################################');
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI is available at: http://localhost:${port}/api`);
}

bootstrap();
