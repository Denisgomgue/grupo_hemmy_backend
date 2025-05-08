import { PaymentStatus, PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  paymentDate?: string;
  transfername: string;
  reference: string;
  reconnection: boolean;
  amount: number;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
  discount: number;
  client?: number;
  dueDate: string;
} 