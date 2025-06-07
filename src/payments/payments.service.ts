import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPaymentsSummaryDto } from './dto/get-payments-summary.dto';
import { Client, PaymentStatus as ClientPaymentStatus } from '../client/entities/client.entity';
import { PaymentHistory } from 'src/payment-history/entities/payment-history.entity';
import { User } from 'src/user/entities/user.entity';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly RECONNECTION_FEE = 10; // Cargo fijo por reconexión

  private readonly estadosEnEspanol = {
    [ PaymentStatus.PENDING ]: 'Pendiente',
    [ PaymentStatus.PAYMENT_DAILY ]: 'Pago al día',
    [ PaymentStatus.LATE_PAYMENT ]: 'Pago Atrasado',
    [ PaymentStatus.VOIDED ]: 'Anulado'
  };

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(PaymentHistory)
    private paymentHistoryRepository: Repository<PaymentHistory>,
  ) { }

  // Helper para manejar números decimales
  private toFloat(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    return parseFloat(parseFloat(value.toString()).toFixed(2));
  }

  private determinarEstadoPago(dueDate: string, paymentDate: string | null): PaymentStatus {
    // Si no hay fecha de pago, el estado es pendiente
    if (!paymentDate) {
      return PaymentStatus.PENDING;
    }

    const fechaVencimiento = new Date(dueDate);
    const fechaPago = new Date(paymentDate);
    fechaVencimiento.setHours(0, 0, 0, 0);
    fechaPago.setHours(0, 0, 0, 0);

    // Si la fecha de pago es mayor que la fecha de vencimiento, es pago atrasado
    if (fechaPago > fechaVencimiento) {
      return PaymentStatus.LATE_PAYMENT;
    }

    // Si la fecha de pago es menor o igual a la fecha de vencimiento, es pago al día
    return PaymentStatus.PAYMENT_DAILY;
  }

  private transformarEstadoAEspanol(estado: PaymentStatus): string {
    return this.estadosEnEspanol[ estado ] || estado;
  }

  private normalizeDate(date: string | Date, description: string = ''): Date {
    // Si es string, asegurarnos de que tenga el formato correcto
    const inputDate = typeof date === 'string'
      ? new Date(`${date.split('T')[ 0 ]}T05:00:00.000Z`)
      : new Date(date);

    // Obtener los componentes de la fecha en UTC
    const year = inputDate.getUTCFullYear();
    const month = inputDate.getUTCMonth();
    const day = inputDate.getUTCDate();

    // Crear una nueva fecha en UTC
    const normalizedDate = new Date(Date.UTC(year, month, day, 5, 0, 0, 0));

    this.logger.debug(`[${description}] 
        Input date: ${inputDate.toISOString()}
        Input UTC date: ${inputDate.getUTCDate()}
        Normalized date: ${normalizedDate.toISOString()}
        Day preserved: ${day} === ${normalizedDate.getUTCDate()}
    `);

    return normalizedDate;
  }

  // Método para actualizar el cliente cuando se realiza un pago
  private async updateClientAfterPayment(clientId: number, dueDate: string) {
    if (!clientId) return;

    try {
      const client = await this.clientRepository.findOne({
        where: { id: clientId },
        relations: [ 'payments' ]
      });

      if (!client) {
        this.logger.warn(`No se encontró el cliente ID ${clientId} para actualizar después del pago`);
        return;
      }

      this.logger.debug(`Actualizando cliente ${clientId}:
        Fecha actual de pago: ${client.paymentDate}
        Fecha inicial de pago: ${client.initialPaymentDate}
        Nueva fecha de vencimiento: ${dueDate}
      `);

      // Actualizar el estado a PAID
      client.paymentStatus = ClientPaymentStatus.PAID;

      // Si no tiene fecha inicial de pago, establecerla
      if (!client.initialPaymentDate) {
        client.initialPaymentDate = this.normalizeDate(dueDate, 'Estableciendo fecha inicial');
        this.logger.debug(`Establecida fecha inicial de pago: ${client.initialPaymentDate.toISOString()}`);
      }

      // Calcular la próxima fecha de pago
      const currentDueDate = this.normalizeDate(dueDate, 'Fecha de vencimiento actual');

      // Crear la próxima fecha de pago manteniendo el día y la hora UTC
      const nextPaymentDate = new Date(currentDueDate);
      nextPaymentDate.setUTCMonth(nextPaymentDate.getUTCMonth() + 1);

      this.logger.debug(`Cálculo de próxima fecha de pago:
        Fecha de vencimiento actual: ${currentDueDate.toISOString()}
        Día original: ${currentDueDate.getUTCDate()}
        Próxima fecha calculada: ${nextPaymentDate.toISOString()}
        Día preservado: ${nextPaymentDate.getUTCDate()} === ${currentDueDate.getUTCDate()}
      `);

      // Actualizar la fecha de próximo pago
      client.paymentDate = nextPaymentDate;

      // Guardar los cambios
      const savedClient = await this.clientRepository.save(client);
      this.logger.debug(`Cliente guardado:
        Nueva fecha de pago: ${savedClient.paymentDate.toISOString()}
        Fecha inicial: ${savedClient.initialPaymentDate.toISOString()}
        Día preservado: ${savedClient.paymentDate.getUTCDate()} === ${savedClient.initialPaymentDate.getUTCDate()}
      `);
    } catch (error) {
      this.logger.error(`Error al actualizar el cliente ${clientId}: ${error.message}`, error.stack);
    }
  }

  private async generatePaymentCode(client: Client): Promise<string> {
    // Obtener la inicial del nombre del cliente
    const clientInitial = client.name.charAt(0).toUpperCase();
    const clientLastNameInitial = client.lastName.charAt(0).toUpperCase();

    // Buscar el último pago del cliente para obtener el último número
    const lastPayment = await this.paymentsRepository.findOne({
      where: { client: { id: client.id } },
      order: { created_At: 'DESC' }
    });

    let nextNumber = 1;
    if (lastPayment && lastPayment.code) {
      // Extraer el número del último código
      const lastNumber = parseInt(lastPayment.code.split('-')[ 1 ]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    // Formatear el número con ceros a la izquierda (4 dígitos)
    const formattedNumber = nextNumber.toString().padStart(4, '0');

    // Generar el código final
    return `PG${clientInitial}${clientLastNameInitial}-${formattedNumber}`;
  }

  async create(createPaymentDto: CreatePaymentDto, user?: User) {
    this.logger.log(`Creando nuevo pago para cliente ID ${createPaymentDto.client || 'sin cliente'}`);

    const client = await this.clientRepository.findOne({
      where: { id: createPaymentDto.client },
      relations: [ 'plan' ],
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (!client.plan) {
      throw new NotFoundException('El cliente no tiene un plan asignado');
    }

    const paymentCode = await this.generatePaymentCode(client);

    // Convertir todos los montos a float con 2 decimales
    const baseAmount = this.toFloat(client.plan.price);
    const reconnectionFee = createPaymentDto.reconnection ? this.toFloat(this.RECONNECTION_FEE) : 0;
    const discount = this.toFloat(createPaymentDto.discount);

    // Si se proporciona un monto total, usamos ese, de lo contrario calculamos
    let totalAmount = createPaymentDto.amount ? this.toFloat(createPaymentDto.amount) : 0;

    // Si no se proporciona un monto total, lo calculamos
    if (!totalAmount) {
      totalAmount = this.toFloat(baseAmount + reconnectionFee - discount);
    }

    this.logger.debug(`Desglose del pago:
      - Monto base (plan): S/. ${baseAmount}
      - Cargo reconexión: S/. ${reconnectionFee}
      - Descuento: S/. ${discount}
      - Total: S/. ${totalAmount}
    `);

    // Normalizar las fechas usando nuestro método
    const paymentDate = createPaymentDto.paymentDate
      ? this.normalizeDate(createPaymentDto.paymentDate, 'Fecha de pago en create')
      : undefined;

    const dueDate = createPaymentDto.dueDate
      ? this.normalizeDate(createPaymentDto.dueDate, 'Fecha de vencimiento en create')
      : undefined;

    const paymentData = {
      ...createPaymentDto,
      code: paymentCode,
      paymentDate,
      dueDate,
      discount: this.toFloat(discount),
      client,
      baseAmount: this.toFloat(baseAmount),
      reconnectionFee: this.toFloat(reconnectionFee),
      amount: this.toFloat(totalAmount)
    };

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

  async findAll(clientId?: number, includeVoided: boolean = false) {
    let query: any = {};

    if (clientId) {
      query.client = { id: clientId };
    }

    if (!includeVoided) {
      query.isVoided = false;
    }

    const payments = await this.paymentsRepository.find({
      where: query,
      relations: [ 'client' ],
      select: {
        client: {
          id: true,
          name: true,
          lastName: true,
          dni: true
        }
      },
      order: {
        created_At: 'DESC'
      }
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

  async update(id: number, updatePaymentDto: UpdatePaymentDto, user?: User) {
    this.logger.log(`Actualizando pago ID ${id}`);

    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: [ 'client', 'client.plan' ]
    });

    if (!payment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    // Convertir todos los montos a float con 2 decimales
    const baseAmount = this.toFloat(payment.client.plan.price);
    const reconnectionFee = updatePaymentDto.reconnection !== undefined ?
      (updatePaymentDto.reconnection ? this.toFloat(this.RECONNECTION_FEE) : 0) :
      (payment.reconnection ? this.toFloat(this.RECONNECTION_FEE) : 0);
    const discount = this.toFloat(updatePaymentDto.discount !== undefined ? updatePaymentDto.discount : payment.discount);

    // Calcular el monto total
    const totalAmount = this.toFloat(baseAmount + reconnectionFee - discount);

    this.logger.debug(`Actualizando montos del pago ID ${id}:
      - Monto base (plan): S/. ${baseAmount}
      - Cargo reconexión: S/. ${reconnectionFee}
      - Descuento: S/. ${discount}
      - Total: S/. ${totalAmount}
    `);

    // Actualizar el pago existente con los nuevos valores
    Object.assign(payment, {
      ...updatePaymentDto,
      baseAmount: this.toFloat(baseAmount),
      reconnectionFee: this.toFloat(reconnectionFee),
      amount: this.toFloat(totalAmount),
      discount: this.toFloat(discount)
    });

    if (updatePaymentDto.paymentDate) {
      payment.paymentDate = new Date(`${updatePaymentDto.paymentDate}T12:00:00Z`);
    }

    const updatedPayment = await this.paymentsRepository.save(payment);

    // Si se está estableciendo una fecha de pago y el pago tiene cliente
    if (updatePaymentDto.paymentDate && payment.client) {
      const dueDate = updatePaymentDto.dueDate || payment.dueDate.toISOString();
      this.logger.debug(`Actualizando estado del cliente ID ${payment.client.id} después de actualizar pago ID ${id}`);
      await this.updateClientAfterPayment(payment.client.id, dueDate);
    }

    // Guardar en el historial de pagos
    const history = this.paymentHistoryRepository.create({
      payment: payment,
      client: payment.client,
      user: user || null,
      amount: totalAmount,
      discount: discount,
      paymentDate: payment.paymentDate,
      dueDate: payment.dueDate,
      reference: payment.reference,
      paymentType: payment.paymentType,
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

    const clientId = payment.client?.id;
    payment.isVoided = true;
    payment.voidedAt = new Date();
    payment.state = PaymentStatus.VOIDED;
    await this.paymentsRepository.save(payment);

    if (clientId) {
      const client = await this.clientRepository.findOne({
        where: { id: clientId },
        relations: [ 'payments' ]
      });

      if (client) {
        this.logger.debug(`Procesando anulación para cliente ${clientId}:
          Fecha actual de pago: ${client.paymentDate}
          Fecha inicial de pago: ${client.initialPaymentDate}
        `);

        // Obtener el último pago válido
        const lastValidPayment = await this.paymentsRepository.findOne({
          where: {
            client: { id: clientId },
            isVoided: false
          },
          order: { dueDate: 'DESC' }
        });

        if (lastValidPayment && lastValidPayment.dueDate) {
          this.logger.debug(`Encontrado último pago válido:
            ID: ${lastValidPayment.id}
            Fecha vencimiento: ${lastValidPayment.dueDate}
          `);

          const nextPaymentDate = this.normalizeDate(lastValidPayment.dueDate, 'Próximo pago desde último válido');
          nextPaymentDate.setUTCMonth(nextPaymentDate.getUTCMonth() + 1);
          client.paymentDate = nextPaymentDate;
        } else if (client.initialPaymentDate) {
          this.logger.debug('No hay pagos válidos, usando fecha inicial');

          const baseDate = this.normalizeDate(client.initialPaymentDate, 'Fecha inicial base');
          const today = new Date();
          today.setUTCHours(12, 0, 0, 0);

          const monthsDiff = (today.getUTCFullYear() - baseDate.getUTCFullYear()) * 12
            + (today.getUTCMonth() - baseDate.getUTCMonth());

          const nextPaymentDate = new Date(baseDate);
          nextPaymentDate.setUTCMonth(baseDate.getUTCMonth() + monthsDiff + 1);

          this.logger.debug(`Calculando desde fecha inicial:
            Meses transcurridos: ${monthsDiff}
            Próxima fecha calculada: ${nextPaymentDate.toISOString()}
          `);

          client.paymentDate = nextPaymentDate;
        }

        const savedClient = await this.clientRepository.save(client);
        this.logger.debug(`Cliente actualizado después de anulación:
          Nueva fecha de pago: ${savedClient.paymentDate}
          Fecha inicial: ${savedClient.initialPaymentDate}
        `);
      }
    }

    // Guardar en historial
    const history = this.paymentHistoryRepository.create({
      payment: payment,
      client: payment.client,
      user: user || null,
      amount: payment.amount,
      discount: payment.discount,
      paymentDate: payment.paymentDate,
      dueDate: payment.dueDate,
      reference: `ANULADO - ${payment.reference || ''}`,
      paymentType: payment.paymentType,
    });
    await this.paymentHistoryRepository.save(history);

    return {
      success: true,
      message: 'Pago anulado correctamente',
      payment: {
        ...payment,
        stateInSpanish: this.transformarEstadoAEspanol(payment.state)
      }
    };
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

  async getLastPaymentDate(clientId: number) {
    this.logger.log(`Buscando última fecha de pago para cliente ID ${clientId}`);

    const lastPayment = await this.paymentHistoryRepository.findOne({
      where: {
        client: { id: clientId },
        paymentDate: Not(IsNull())
      },
      order: {
        paymentDate: 'DESC'
      }
    });

    if (!lastPayment) {
      this.logger.debug(`No se encontraron pagos para el cliente ID ${clientId}`);
      return null;
    }

    this.logger.debug(`Última fecha de pago encontrada: ${lastPayment.paymentDate}`);
    return {
      lastPaymentDate: lastPayment.paymentDate,
      amount: lastPayment.amount,
      discount: lastPayment.discount,
      reference: lastPayment.reference,
      paymentType: lastPayment.paymentType
    };
  }

  // Método para obtener el desglose de un pago
  async getPaymentBreakdown(id: number) {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: [ 'client', 'client.plan' ]
    });

    if (!payment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return {
      total: payment.amount,
      breakdown: {
        planAmount: payment.baseAmount,
        reconnectionFee: payment.reconnectionFee,
        discount: payment.discount || 0
      },
      details: {
        planName: payment.client.plan.name,
        includesReconnection: payment.reconnection,
        paymentDate: payment.paymentDate,
        dueDate: payment.dueDate
      }
    };
  }

  // Método para recalcular estados de pagos existentes
  async recalculateAllPaymentStates() {
    this.logger.log('Iniciando recálculo de estados de todos los pagos');

    const payments = await this.paymentsRepository.find({
      relations: [ 'client' ]
    });

    let updated = 0;
    let errors = 0;

    for (const payment of payments) {
      try {
        if (!payment.dueDate) {
          this.logger.warn(`Pago ID ${payment.id} no tiene fecha de vencimiento, se mantiene estado actual`);
          continue;
        }

        const newState = this.determinarEstadoPago(
          payment.dueDate.toISOString(),
          payment.paymentDate ? payment.paymentDate.toISOString() : null
        );

        if (payment.state !== newState) {
          payment.state = newState;
          await this.paymentsRepository.save(payment);
          updated++;
          this.logger.debug(`Pago ID ${payment.id} actualizado a estado: ${newState}`);
        }
      } catch (error) {
        errors++;
        this.logger.error(`Error actualizando pago ID ${payment.id}: ${error.message}`);
      }
    }

    return {
      total: payments.length,
      updated,
      errors,
      message: `Se procesaron ${payments.length} pagos. ${updated} actualizados. ${errors} errores.`
    };
  }

  // Método para regenerar códigos de pago
  async regeneratePaymentCodes() {
    this.logger.log('Iniciando regeneración de códigos de pago');

    const payments = await this.paymentsRepository.find({
      relations: [ 'client' ],
      order: {
        client: { id: 'ASC' },
        created_At: 'ASC'
      }
    });

    let updated = 0;
    let errors = 0;
    let currentClientId = null;
    let currentSequence = 1;

    for (const payment of payments) {
      try {
        if (!payment.client) {
          this.logger.warn(`Pago ID ${payment.id} no tiene cliente asociado, se usará código genérico`);
          const formattedNumber = payment.id.toString().padStart(4, '0');
          payment.code = `PGXX-${formattedNumber}`;
        } else {
          // Si cambiamos de cliente, reiniciamos la secuencia
          if (currentClientId !== payment.client.id) {
            currentClientId = payment.client.id;
            currentSequence = 1;
          }

          const clientInitial = payment.client.name.charAt(0).toUpperCase();
          const clientLastNameInitial = payment.client.lastName.charAt(0).toUpperCase();
          const formattedNumber = currentSequence.toString().padStart(4, '0');
          payment.code = `PG${clientInitial}${clientLastNameInitial}-${formattedNumber}`;

          currentSequence++;
        }

        await this.paymentsRepository.save(payment);
        updated++;
        this.logger.debug(`Pago ID ${payment.id} actualizado con código: ${payment.code}`);
      } catch (error) {
        errors++;
        this.logger.error(`Error actualizando pago ID ${payment.id}: ${error.message}`);
      }
    }

    return {
      total: payments.length,
      updated,
      errors,
      message: `Se procesaron ${payments.length} pagos. ${updated} actualizados. ${errors} errores.`
    };
  }
}
