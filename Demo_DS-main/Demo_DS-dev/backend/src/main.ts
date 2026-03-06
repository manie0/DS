import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend React (localhost:5173 en dev)
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Pipe global de validación con transformación automática de tipos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true,
      transform: true,          // Transforma el body al tipo del DTO
      transformOptions: {
        enableImplicitConversion: true, // Convierte query params a números automáticamente
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\n🚀 Servidor Observer iniciado en http://localhost:${port}`);
  console.log(`📡 Endpoints disponibles:`);
  console.log(`   POST   http://localhost:${port}/alerts/evaluate`);
  console.log(`   GET    http://localhost:${port}/alerts`);
  console.log(`   GET    http://localhost:${port}/alerts/active`);
  console.log(`   GET    http://localhost:${port}/alerts/:id`);
  console.log(`   PATCH  http://localhost:${port}/alerts/:id/resolve`);
  console.log(`   GET    http://localhost:${port}/alerts/tank/:tankId`);
  console.log(`   POST   http://localhost:${port}/setup/tanks`);
  console.log(`   POST   http://localhost:${port}/setup/thresholds\n`);
}

bootstrap();
