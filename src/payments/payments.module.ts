import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Client } from 'src/client/entities/client.entity';
import { PaymentHistory } from 'src/payment-histories/entities/payment-history.entity';
import { Installation } from 'src/installations/entities/installation.entity';
import { ClientPaymentConfig } from 'src/client-payment-config/entities/client-payment-config.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Client,
      PaymentHistory,
      Installation,
      ClientPaymentConfig
    ]),
    NotificationsModule
  ],
  controllers: [ PaymentsController ],
  providers: [ PaymentsService ],
})
export class PaymentsModule { }
