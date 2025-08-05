import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientPaymentConfig } from './entities/client-payment-config.entity';
import { Installation } from '../installations/entities/installation.entity';
import { ClientPaymentConfigService } from './client-payment-config.service';
import { ClientPaymentConfigController } from './client-payment-config.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ClientPaymentConfig,
            Installation
        ])
    ],
    controllers: [ ClientPaymentConfigController ],
    providers: [ ClientPaymentConfigService ],
    exports: [ TypeOrmModule, ClientPaymentConfigService ]
})
export class ClientPaymentConfigModule { } 