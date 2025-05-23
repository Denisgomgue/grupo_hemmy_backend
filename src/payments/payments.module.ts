import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Client } from 'src/client/entities/client.entity';
import { PaymentHistory } from 'src/payment-history/entities/payment-history.entity';

@Module({
  imports: [ TypeOrmModule.forFeature([ Payment, Client, PaymentHistory ]) ],
  controllers: [ PaymentsController ],
  providers: [ PaymentsService ],
})
export class PaymentsModule { }
