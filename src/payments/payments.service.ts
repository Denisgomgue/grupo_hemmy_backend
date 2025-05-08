import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly estadosEnEspanol = {
    [PaymentStatus.PENDING]: 'Pendiente',
    [PaymentStatus.PAYMENT_DAILY]: 'Pago al día',
    [PaymentStatus.LATE_PAYMENT]: 'Pago Atrasado'
  };

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  private determinarEstadoPago(dueDate: string, paymentDate: string): PaymentStatus {
    const hoy = new Date();
    const fechaVencimiento = new Date(dueDate);
    const fechaPago = paymentDate ? new Date(paymentDate) : null;
    const diasParaVencer = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    console.log(fechaPago, fechaVencimiento, diasParaVencer);
    
    if (fechaPago) {
      if (fechaPago > fechaVencimiento) {
        return PaymentStatus.LATE_PAYMENT;
      }
      return PaymentStatus.PAYMENT_DAILY;
    } else {
      if (hoy > fechaVencimiento) {
        return PaymentStatus.LATE_PAYMENT;
      } else if (diasParaVencer <= 7) {
        return PaymentStatus.PENDING;
      }
      return PaymentStatus.PENDING;
    }
  }

  private transformarEstadoAEspanol(estado: PaymentStatus): string {
    return this.estadosEnEspanol[estado] || estado;
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const payment = this.paymentsRepository.create({
      ...createPaymentDto,
      client: { id: createPaymentDto.client }
    });
    payment.state = this.determinarEstadoPago(createPaymentDto.dueDate, createPaymentDto.paymentDate);
    const savedPayment = await this.paymentsRepository.save(payment);
    return {
      ...savedPayment,
      stateInSpanish: this.transformarEstadoAEspanol(savedPayment.state)
    };
  }

  async findAll() {
    const payments = await this.paymentsRepository.find();
    return payments.map(payment => ({
      ...payment,
      stateInSpanish: this.transformarEstadoAEspanol(payment.state)
    }));
  }

  async findOne(id: number) {
    const payment = await this.paymentsRepository.findOneBy({ id });
    if (!payment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    return {
      ...payment,
      stateInSpanish: this.transformarEstadoAEspanol(payment.state)
    };
  }

  async update(id: number, updatePaymentDto: Partial<CreatePaymentDto>) {
    const updateData = {
      ...updatePaymentDto,
      client: updatePaymentDto.client ? { id: updatePaymentDto.client } : undefined
    };
    await this.paymentsRepository.update(id, updateData);
    const updatedPayment = await this.findOne(id);
    return {
      ...updatedPayment,
      stateInSpanish: this.transformarEstadoAEspanol(updatedPayment.state)
    };
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    if (!payment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    return this.paymentsRepository.remove(payment);
  }
}
