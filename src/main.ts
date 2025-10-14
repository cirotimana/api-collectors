import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.21.41:3030'], // Tu frontend
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe());

  // Prefix global
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3040;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 API running on port: ${port}`);
}
bootstrap();