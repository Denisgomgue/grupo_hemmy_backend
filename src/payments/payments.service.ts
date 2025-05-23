import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPaymentsSummaryDto } from './dto/get-payments-summary.dto';
import { Client, PaymentStatus as ClientPaymentStatus } from '../client/entities/client.entity';
import { PaymentHistory } from 'src/payment-history/entities/payment-history.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private readonly estadosEnEspanol = {
    [ PaymentStatus.PENDING ]: 'Pendiente',
    [ PaymentStatus.PAYMENT_DAILY ]: 'Pago al día',
    [ PaymentStatus.LATE_PAYMENT ]: 'Pago Atrasado'
  };

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(PaymentHistory)
    private paymentHistoryRepository: Repository<PaymentHistory>,
  ) { }

  private determinarEstadoPago(dueDate: string, paymentDate: string): PaymentStatus {
    const hoy = new Date();
    hoy.setUTCHours(12, 0, 0, 0);
    
    const fechaVencimiento = new Date(dueDate);
    fechaVencimiento.setUTCHours(12, 0, 0, 0);
    
    const fechaPago = paymentDate ? new Date(paymentDate) : null;
    if (fechaPago) {
      fechaPago.setUTCHours(12, 0, 0, 0);
    }
    
    const diasParaVencer = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    this.logger.debug(`Calculando estado de pago - Fecha pago: ${fechaPago}, Vencimiento: ${fechaVencimiento}, Días para vencer: ${diasParaVencer}`);

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
    return this.estadosEnEspanol[ estado ] || estado;
  }

  // Método para actualizar el cliente cuando se realiza un pago
  private async updateClientAfterPayment(clientId: number, dueDate: string) {
    if (!clientId) return;

    try {
      const client = await this.clientRepository.findOne({ where: { id: clientId } });
      if (!client) {
        this.logger.warn(`No se encontró el cliente ID ${clientId} para actualizar después del pago`);
        return;
      }

      // Calcular la nueva fecha de próximo pago (un mes después de la fecha actual de vencimiento)
      const currentDueDate = new Date(dueDate);
      const nextDueDate = new Date(currentDueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      nextDueDate.setUTCHours(12, 0, 0, 0); // Estandarizar la hora a mediodía UTC

      // Actualizar la fecha de próximo pago
      client.paymentDate = nextDueDate;

      // Calcular el estado basado en la nueva fecha
      const hoy = new Date();
      hoy.setUTCHours(12, 0, 0, 0);
      const diffDays = Math.floor((nextDueDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 7) {
        client.paymentStatus = ClientPaymentStatus.PAID;
      } else if (diffDays >= 0 && diffDays <= 7) {
        client.paymentStatus = ClientPaymentStatus.EXPIRING;
      } else {
        client.paymentStatus = ClientPaymentStatus.EXPIRED;
      }

      this.logger.log(`Cliente ${clientId} actualizado: Estado = ${client.paymentStatus}, Próximo pago = ${nextDueDate.toISOString()}`);
      
      // Guardar los cambios
      await this.clientRepository.save(client);
    } catch (error) {
      this.logger.error(`Error al actualizar el cliente ${clientId} después del pago: ${error.message}`, error.stack);
    }
  }

  async create(createPaymentDto: CreatePaymentDto, user?: User) {
    this.logger.log(`Creando nuevo pago para cliente ID ${createPaymentDto.client || 'sin cliente'}`);

    const paymentData = {
      ...createPaymentDto,
      paymentDate: createPaymentDto.paymentDate ? new Date(`${createPaymentDto.paymentDate}T12:00:00Z`) : undefined,
      discount: createPaymentDto.discount === undefined ? 0 : createPaymentDto.discount,
      client: createPaymentDto.client === undefined ? undefined : { id: createPaymentDto.client }
    };

    if (paymentData.client === undefined) {
      delete paymentData.client;
    }

    const payment = this.paymentsRepository.create(paymentData);

    if (createPaymentDto.dueDate) {
      payment.state = this.determinarEstadoPago(createPaymentDto.dueDate, createPaymentDto.paymentDate);
      this.logger.debug(`Estado calculado para el pago: ${payment.state}`);
    } else {
      payment.state = PaymentStatus.PENDING;
    }

    const savedPayment = await this.paymentsRepository.save(payment);
    this.logger.log(`Pago guardado con ID ${savedPayment.id}`);

    // Si es un pago realizado (tiene fecha de pago) y tiene un cliente, actualizamos el cliente
    if (createPaymentDto.paymentDate && createPaymentDto.client && createPaymentDto.dueDate) {
      this.logger.debug(`Actualizando estado del cliente después del pago ID ${savedPayment.id}`);
      await this.updateClientAfterPayment(createPaymentDto.client, createPaymentDto.dueDate);
    }

    // Guardar en el historial de pagos
    const history = this.paymentHistoryRepository.create({
      payment: savedPayment,
      client: savedPayment.client,
      user: user || null,
      amount: savedPayment.amount,
      discount: savedPayment.discount,
      paymentDate: savedPayment.paymentDate,
      dueDate: savedPayment.dueDate,
      reference: savedPayment.reference,
      paymentType: savedPayment.paymentType,
    });
    await this.paymentHistoryRepository.save(history);
    this.logger.log(`Historial de pago creado para pago ID ${savedPayment.id}`);

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
      relations: [ 'client' ]
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

  async update(id: number, updatePaymentDto: Partial<CreatePaymentDto>, user?: User) {
    this.logger.log(`Actualizando pago ID ${id}`);

    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: [ 'client' ]
    });

    if (!payment) {
      this.logger.warn(`Intento de actualizar pago inexistente ID ${id}`);
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    const updateData = {
      ...updatePaymentDto,
      client: updatePaymentDto.client ? { id: updatePaymentDto.client } : undefined
    };

    await this.paymentsRepository.update(id, updateData);
    this.logger.debug(`Datos básicos del pago ID ${id} actualizados`);

    // Si se está estableciendo una fecha de pago y el pago tiene cliente
    if (updatePaymentDto.paymentDate && (payment.client || updatePaymentDto.client)) {
      const clientId = updatePaymentDto.client || payment.client.id;
      const dueDate = updatePaymentDto.dueDate || payment.dueDate.toISOString();
      this.logger.debug(`Actualizando estado del cliente ID ${clientId} después de actualizar pago ID ${id}`);
      await this.updateClientAfterPayment(clientId, dueDate);
    }

    const updatedPayment = await this.findOne(id);

    // Guardar en el historial de pagos
    const history = this.paymentHistoryRepository.create({
      payment: payment,
      client: payment.client,
      user: user || null,
      amount: updatePaymentDto.amount ?? payment.amount,
      discount: updatePaymentDto.discount ?? payment.discount,
      paymentDate: updatePaymentDto.paymentDate ?? payment.paymentDate,
      dueDate: updatePaymentDto.dueDate ?? payment.dueDate,
      reference: updatePaymentDto.reference ?? payment.reference,
      paymentType: updatePaymentDto.paymentType ?? payment.paymentType,
    });
    await this.paymentHistoryRepository.save(history);
    this.logger.log(`Historial de actualización creado para pago ID ${id}`);

    return {
      ...updatedPayment,
      stateInSpanish: this.transformarEstadoAEspanol(updatedPayment.state)
    };
  }

  async remove(id: number, user?: User) {
    const payment = await this.findOne(id);
    if (!payment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    // Guardar en el historial de pagos antes de eliminar
    const history = this.paymentHistoryRepository.create({
      payment: payment,
      client: payment.client,
      user: user || null,
      amount: payment.amount,
      discount: payment.discount,
      paymentDate: payment.paymentDate,
      dueDate: payment.dueDate,
      reference: payment.reference,
      paymentType: payment.paymentType,
    });
    await this.paymentHistoryRepository.save(history);
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
      whereConditions.paymentDate = Between(today, tomorrow);
    } else if (period === 'thisMonth') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      whereConditions.paymentDate = Between(firstDayOfMonth, lastDayOfMonth);
    } else if (period === 'last7Days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      const dayAfterToday = new Date(today);
      dayAfterToday.setDate(today.getDate() + 1);
      whereConditions.paymentDate = Between(sevenDaysAgo, dayAfterToday);
    }

    // Traer todos los pagos del periodo
    const payments = await this.paymentsRepository.find({
      where: whereConditions,
      select: [ 'amount', 'discount', 'state' ]
    });

    // Calcular los valores para las cards
    let totalRecaudado = 0;
    let pagosPagados = 0;
    let pagosPendientes = 0;
    let pagosAtrasados = 0;

    for (const pago of payments) {
      if (pago.state === PaymentStatus.PAYMENT_DAILY) {
        pagosPagados++;
        totalRecaudado += (pago.amount - (pago.discount || 0));
      } else if (pago.state === PaymentStatus.PENDING) {
        pagosPendientes++;
      } else if (pago.state === PaymentStatus.LATE_PAYMENT) {
        pagosAtrasados++;
        totalRecaudado += (pago.amount - (pago.discount || 0));
      }
    }

    return {
      totalRecaudado,
      pagosPagados,
      pagosPendientes,
      pagosAtrasados,
      period: period || 'all'
    };
  }
}
