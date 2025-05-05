import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DatabaseSeederService } from './database/seeders/database-seeders.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seeder = app.get(DatabaseSeederService)
  await seeder.seed()
  app.enableCors();
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
