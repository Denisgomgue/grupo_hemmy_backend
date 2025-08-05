import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DatabaseSeederService } from './database/seeders/database-seeders.service';
import { ValidationPipe } from '@nestjs/common';
import { DatabaseErrorFilter } from './filters/database-error.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const seeder = app.get(DatabaseSeederService)
  await seeder.seed()
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: false,
    },
  }));
  app.useGlobalFilters(new DatabaseErrorFilter());

  // Configurar archivos estáticos usando process.cwd() para asegurar la ruta correcta
  const uploadsPath = join(process.cwd(), 'uploads');
  // Log removido para limpieza

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  await app.listen(3000);
  // Log removido para limpieza
  // Log removido para limpieza

}
bootstrap();
