import { Module } from '@nestjs/common';
import { PaymentHistoriesService } from './payment-histories.service';
import { PaymentHistoriesController } from './payment-histories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentHistory } from './entities/payment-history.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Client } from 'src/client/entities/client.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentHistory, Payment, Client, User])],
  controllers: [PaymentHistoriesController],
  providers: [PaymentHistoriesService],
  exports: [TypeOrmModule, PaymentHistoriesService]
})
export class PaymentHistoriesModule {}
