import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallationsService } from './installations.service';
import { InstallationsController } from './installations.controller';
import { Installation } from './entities/installation.entity';
import { Client } from '../client/entities/client.entity';
import { ClientPaymentConfig } from '../client-payment-config/entities/client-payment-config.entity';
import { Device } from '../devices/entities/device.entity';
import { Plan } from '../plans/entities/plan.entity';
import { Sector } from '../sectors/entities/sector.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Installation,
            Client,
            ClientPaymentConfig,
            Device,
            Plan,
            Sector
        ])
    ],
    controllers: [ InstallationsController ],
    providers: [ InstallationsService ],
    exports: [ InstallationsService ],
})
export class InstallationsModule { } 