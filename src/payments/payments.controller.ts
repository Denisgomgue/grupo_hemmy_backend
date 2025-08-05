import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { calculateNextPaymentDate } from 'src/utils/date.utils';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPaymentsSummaryDto } from './dto/get-payments-summary.dto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) { }

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      return await this.paymentsService.create(createPaymentDto);
    } catch (error) {
      // 🎯 MANEJO DE ERRORES: Convertir errores de validación a HTTP 400
      if (error.message && (
        error.message.includes('Ya existe un pago registrado') ||
        error.message.includes('Solo se permiten múltiples pagos') ||
        error.message.includes('No se puede registrar un pago con fecha futura') ||
        error.message.includes('excepto para reconexiones') ||
        error.message.includes('aplazamientos pendientes') ||
        error.message.includes('Cliente sin fecha inicial')
      )) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
          error: 'Bad Request'
        }, HttpStatus.BAD_REQUEST);
      }

      // Para otros errores, mantener el comportamiento original
      throw error;
    }
  }

  @Post('advance-payment')
  handleAdvancePayment(@Body() body: { clientId: number; amount: number }) {
    return this.paymentsService.handleAdvancePayment(body.clientId, body.amount);
  }

  @Get('next-payment-date/:clientId')
  getNextPaymentDate(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.paymentsService.getNextPaymentDate(clientId);
  }

  // @Get('debug-data')
  // getDebugData() {
  //   return this.paymentsService.getDebugData();
  // }

  @Get('summary')
  getSummary(@Query() getPaymentsSummaryDto: GetPaymentsSummaryDto) {
    return this.paymentsService.getSummary(getPaymentsSummaryDto);
  }

  @Get('predictions')
  getPaymentPredictions(@Query('period') period?: string) {
    return this.paymentsService.getPaymentPredictions(period);
  }

  @Get()
  findAll(@Query('client') clientId?: string) {
    return this.paymentsService.findAll(clientId ? parseInt(clientId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePaymentDto: Partial<CreatePaymentDto>) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }

  @Post('recalculate-states')
  recalculateStates() {
    return this.paymentsService.recalculateAllPaymentStates();
  }

  @Post('regenerate-codes')
  regenerateCodes() {
    return this.paymentsService.regeneratePaymentCodes();
  }

  @Post('check-suspensions')
  async checkSuspensions() {
    // 🎯 ENDPOINT: Verificar suspensiones automáticas
    // Se puede llamar desde un cron job o manualmente
    const result = await this.paymentsService.checkAllClientSuspensions();
    return {
      message: 'Verificación de suspensiones completada',
      suspendedClients: result.suspendedCount,
      totalChecked: result.totalChecked
    };
  }

  @Post('sync-client-status/:clientId')
  async syncClientStatus(@Param('clientId', ParseIntPipe) clientId: number) {
    // 🎯 ENDPOINT: Sincronizar estado del cliente basado en client_payment_config
    const wasSynced = await this.paymentsService.syncClientStatusFromPaymentConfig(clientId);
    return {
      message: wasSynced ? 'Estado del cliente sincronizado' : 'No se requirió sincronización',
      clientId,
      synced: wasSynced
    };
  }

  @Post('sync-all-client-statuses')
  async syncAllClientStatuses() {
    // 🎯 ENDPOINT: Recalcular y sincronizar estados de todos los clientes
    const result = await this.paymentsService.recalculateAndSyncAllClientStatuses();
    return {
      message: `Recálculo y sincronización completada: ${result.syncedCount} clientes sincronizados, ${result.recalculatedCount} paymentStatus recalculados de ${result.totalChecked} verificados`,
      syncedCount: result.syncedCount,
      totalChecked: result.totalChecked,
      recalculatedCount: result.recalculatedCount,
      details: result.details
    };
  }

  @Post('deactivate-client/:clientId')
  async deactivateClient(@Param('clientId', ParseIntPipe) clientId: number) {
    // 🎯 ENDPOINT: Dar de baja definitiva a un cliente
    const result = await this.paymentsService.deactivateClient(clientId);
    return {
      message: `Cliente ${clientId} dado de baja definitiva`,
      clientId,
      previousStatus: result.previousStatus,
      newStatus: result.newStatus
    };
  }

  @Get('find-client/:name')
  async findClientByName(@Param('name') name: string) {
    // 🎯 ENDPOINT: Buscar cliente por nombre
    const client = await this.paymentsService.getClientById(1); // Temporal, buscar por ID específico

    return {
      clients: [ {
        id: client.id,
        name: `${client.name} ${client.lastName}`,
        status: client.status,
        dni: client.dni
      } ]
    };
  }

  @Get('test-payment-status/:clientId')
  async testPaymentStatus(@Param('clientId', ParseIntPipe) clientId: number) {
    // 🎯 ENDPOINT: Probar cálculo de paymentStatus para un cliente específico
    const payments = await this.paymentsService.findAll(clientId);

    if (!payments || payments.length === 0) {
      throw new HttpException('No se encontraron pagos para este cliente', HttpStatus.NOT_FOUND);
    }

    // Obtener la configuración de pago del cliente
    const installation = await this.paymentsService.getInstallationByClientId(clientId);

    if (!installation?.paymentConfig) {
      throw new HttpException('No se encontró configuración de pago para este cliente', HttpStatus.NOT_FOUND);
    }

    // Calcular la próxima fecha de vencimiento basada en los pagos existentes
    let nextDueDate: Date;
    if (payments.length === 0) {
      // Si no hay pagos, usar la fecha inicial
      nextDueDate = installation.paymentConfig.initialPaymentDate;
    } else {
      // Calcular la próxima fecha de vencimiento basada en la cantidad de pagos
      nextDueDate = calculateNextPaymentDate(installation.paymentConfig.initialPaymentDate);
      for (let i = 1; i < payments.length; i++) {
        nextDueDate = calculateNextPaymentDate(nextDueDate);
      }
    }

    // Obtener el último pago para mostrar información
    const lastPayment = payments[ 0 ]; // findAll ordena por created_at DESC
    const paymentDate = new Date(lastPayment.paymentDate);
    const dueDate = new Date(lastPayment.dueDate);

    this.logger.log(`🔍 PROBANDO CÁLCULO DE PAYMENTSTATUS PARA CLIENTE ${clientId}:`);
    this.logger.log(`   - Fecha de pago: ${paymentDate.toISOString()}`);
    this.logger.log(`   - Fecha de vencimiento del último pago: ${dueDate.toISOString()}`);
    this.logger.log(`   - Próxima fecha de vencimiento calculada: ${nextDueDate.toISOString()}`);
    this.logger.log(`   - Es pago atrasado: ${paymentDate > dueDate}`);

    // Calcular paymentStatus usando la próxima fecha de vencimiento
    const { status: calculatedStatus, description } = this.paymentsService.calculatePaymentStatusPublic(
      nextDueDate,
      installation.paymentConfig.advancePayment
    );

    // Obtener el estado actual del cliente
    const client = await this.paymentsService.getClientById(clientId);

    return {
      clientId,
      clientName: `${client.name} ${client.lastName}`,
      currentClientStatus: client.status,
      lastPayment: {
        paymentDate: lastPayment.paymentDate,
        dueDate: lastPayment.dueDate,
        isLatePayment: paymentDate > dueDate,
        paymentStatus: lastPayment.status
      },
      paymentConfig: {
        initialPaymentDate: installation.paymentConfig.initialPaymentDate,
        advancePayment: installation.paymentConfig.advancePayment,
        currentPaymentStatus: installation.paymentConfig.paymentStatus
      },
      calculatedPaymentStatus: {
        status: calculatedStatus,
        description: description
      },
      message: `PaymentStatus calculado: ${calculatedStatus}`
    };
  }

  @Get('test-reconnection/:clientId')
  async testReconnection(@Param('clientId', ParseIntPipe) clientId: number) {
    // 🎯 ENDPOINT: Probar reconexión automática para un cliente específico
    const payments = await this.paymentsService.findAll(clientId);

    if (!payments || payments.length === 0) {
      throw new HttpException('No se encontraron pagos para este cliente', HttpStatus.NOT_FOUND);
    }

    // Obtener el último pago
    const lastPayment = payments[ 0 ]; // findAll ordena por created_at DESC
    const paymentDate = new Date(lastPayment.paymentDate);
    const dueDate = new Date(lastPayment.dueDate);

    this.logger.log(`🔍 PROBANDO RECONEXIÓN PARA CLIENTE ${clientId}:`);
    this.logger.log(`   - Fecha de pago: ${paymentDate.toISOString()}`);
    this.logger.log(`   - Fecha de vencimiento: ${dueDate.toISOString()}`);
    this.logger.log(`   - Es pago atrasado: ${paymentDate > dueDate}`);

    const wasReconnected = await this.paymentsService.checkAndReconnectClient(
      clientId,
      paymentDate,
      dueDate
    );

    // Obtener el estado actual del cliente después de la prueba
    const client = await this.paymentsService.getClientById(clientId);

    return {
      clientId,
      lastPayment: {
        paymentDate: lastPayment.paymentDate,
        dueDate: lastPayment.dueDate,
        isLatePayment: paymentDate > dueDate
      },
      wasReconnected,
      currentClientStatus: client?.status,
      message: wasReconnected ? 'Cliente reconectado' : 'Cliente no requirió reconexión'
    };
  }
}
