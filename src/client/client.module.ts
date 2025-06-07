import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Crear el directorio de uploads para clientes si no existe
const uploadDir = join(process.cwd(), 'uploads/clients');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    TypeOrmModule.forFeature([ Client, Plan, Payment ]),
    ScheduleModule.forRoot(),
    MulterModule.register({
      dest: uploadDir,
    })
  ],
  controllers: [ ClientController ],
  providers: [ ClientService ],
  exports: [ ClientService, TypeOrmModule ]
})
export class ClientModule { }
