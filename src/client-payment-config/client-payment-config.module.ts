import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientPaymentConfig } from './entities/client-payment-config.entity';

@Module({
    imports: [ TypeOrmModule.forFeature([ ClientPaymentConfig ]) ],
    exports: [ TypeOrmModule ]
})
export class ClientPaymentConfigModule { } 