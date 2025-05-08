import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPaymentsSummaryDto } from './dto/get-payments-summary.dto';
import { Client, PaymentStatus as ClientPaymentStatus } from '../client/entities/client.entity';

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
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
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

  // Método para actualizar el cliente cuando se realiza un pago
  private async updateClientAfterPayment(clientId: number, dueDate: string) {
    if (!clientId) return;
    
    try {
      const client = await this.clientRepository.findOne({ where: { id: clientId } });
      if (!client) return;
      
      // Actualizar el estado a PAGADO
      client.paymentStatus = ClientPaymentStatus.PAID;
      
      // Calcular la nueva fecha de próximo pago (un mes después de la fecha actual de vencimiento)
      const currentDueDate = new Date(dueDate);
      const nextDueDate = new Date(currentDueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      
      // Actualizar la fecha de próximo pago
      client.paymentDate = nextDueDate;
      
      // Guardar los cambios
      await this.clientRepository.save(client);
      console.log(`Cliente ${clientId} actualizado: Estado = PAID, Próximo pago = ${nextDueDate.toISOString()}`);
    } catch (error) {
      console.error(`Error al actualizar el cliente ${clientId} después del pago:`, error);
    }
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const paymentData = {
      ...createPaymentDto,
      discount: createPaymentDto.discount === undefined ? 0 : createPaymentDto.discount,
      client: createPaymentDto.client === undefined ? undefined : { id: createPaymentDto.client }
    };

    if (paymentData.client === undefined) {
      delete paymentData.client;
    }

    const payment = this.paymentsRepository.create(paymentData);
    
    if (createPaymentDto.dueDate) {
      payment.state = this.determinarEstadoPago(createPaymentDto.dueDate, createPaymentDto.paymentDate);
    } else {
      payment.state = PaymentStatus.PENDING;
    }

    const savedPayment = await this.paymentsRepository.save(payment);
    
    // Si es un pago realizado (tiene fecha de pago) y tiene un cliente, actualizamos el cliente
    if (createPaymentDto.paymentDate && createPaymentDto.client && createPaymentDto.dueDate) {
      await this.updateClientAfterPayment(createPaymentDto.client, createPaymentDto.dueDate);
    }
    
    return {
      ...savedPayment,
      stateInSpanish: this.transformarEstadoAEspanol(savedPayment.state)
    };
  }

  async findAll(clientId?: number) {
    let query = {};
    
    if (clientId) {
      query = { client: { id: clientId } };
    }
    
    const payments = await this.paymentsRepository.find({ 
      where: query,
      relations: ['client'] 
    });
    
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
    const payment = await this.paymentsRepository.findOne({ 
      where: { id },
      relations: ['client']
    });
    
    if (!payment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    
    const updateData = {
      ...updatePaymentDto,
      client: updatePaymentDto.client ? { id: updatePaymentDto.client } : undefined
    };
    
    await this.paymentsRepository.update(id, updateData);
    
    // Si se está estableciendo una fecha de pago y el pago tiene cliente
    if (updatePaymentDto.paymentDate && (payment.client || updatePaymentDto.client)) {
      const clientId = updatePaymentDto.client || payment.client.id;
      const dueDate = updatePaymentDto.dueDate || payment.dueDate.toISOString();
      await this.updateClientAfterPayment(clientId, dueDate);
    }
    
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

  async getSummary(getPaymentsSummaryDto: GetPaymentsSummaryDto) {
    const { period } = getPaymentsSummaryDto;
    let whereConditions: any = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      whereConditions.dueDate = Between(today, tomorrow); 
    } else if (period === 'thisMonth') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      whereConditions.dueDate = Between(firstDayOfMonth, lastDayOfMonth);
    } else if (period === 'last7Days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); 
      const dayAfterToday = new Date(today);
      dayAfterToday.setDate(today.getDate() + 1);
      whereConditions.dueDate = Between(sevenDaysAgo, dayAfterToday);
    }

    const payments = await this.paymentsRepository.find({ where: whereConditions });

    let totalRecaudado = 0;
    let pagosPagados = 0;
    let pagosPendientes = 0;
    let pagosAtrasados = 0;

    for (const pago of payments) {
      if (pago.state === PaymentStatus.PAYMENT_DAILY || pago.state === PaymentStatus.LATE_PAYMENT) {
        totalRecaudado += Number(pago.amount); 
      }

      if (pago.state === PaymentStatus.PAYMENT_DAILY) {
        pagosPagados++;
      } else if (pago.state === PaymentStatus.PENDING) {
        pagosPendientes++;
      } else if (pago.state === PaymentStatus.LATE_PAYMENT) {
        pagosAtrasados++;
      }
    }

    return {
      totalRecaudado: parseFloat(totalRecaudado.toFixed(2)),
      pagosPagados,
      pagosPendientes,
      pagosAtrasados,
      periodoUtilizado: period
    };
  }
}
