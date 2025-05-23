import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, AccountStatus, PaymentStatus as ClientEntityPaymentStatus } from './entities/client.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addMonths, differenceInDays, startOfDay } from 'date-fns';
import { Between } from 'typeorm';
import { GetClientsSummaryDto } from './dto/get-clients-summary.dto';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) { }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const clientData: Partial<Client> = {
      name: createClientDto.name,
      lastName: createClientDto.lastName,
      dni: createClientDto.dni,
      phone: createClientDto.phone,
      address: createClientDto.address,
      reference: createClientDto.reference,
      advancePayment: createClientDto.advancePayment,
      status: createClientDto.status,
      description: createClientDto.description,
      routerSerial: createClientDto.routerSerial,
      decoSerial: createClientDto.decoSerial,
      plan: createClientDto.plan ? { id: createClientDto.plan } as any : null,
      sector: createClientDto.sector ? { id: createClientDto.sector } as any : null,
    };

    if (createClientDto.installationDate) {
      clientData.installationDate = new Date(`${createClientDto.installationDate}T12:00:00Z`);
    }
    if (createClientDto.paymentDate && !createClientDto.advancePayment && !clientData.installationDate) {
      clientData.paymentDate = new Date(`${createClientDto.paymentDate}T12:00:00Z`);
    }

    if (clientData.advancePayment && clientData.installationDate) {
      const baseDate = new Date(clientData.installationDate);
      baseDate.setMonth(baseDate.getMonth() + 1);
      clientData.paymentDate = new Date(Date.UTC(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        12, 0, 0
      ));
      clientData.paymentStatus = ClientEntityPaymentStatus.PAID;
      this.logger.log(`Cliente DNI ${createClientDto.dni} con adelanto. Próximo pago: ${clientData.paymentDate}`);
    } else if (clientData.advancePayment && !clientData.installationDate) {
      this.logger.warn(`Cliente DNI ${createClientDto.dni} con adelanto pero sin fecha de instalación. Próximo pago no calculado.`);
      clientData.paymentStatus = ClientEntityPaymentStatus.PAID;
    } else {
      clientData.paymentStatus = ClientEntityPaymentStatus.EXPIRING;
      if (clientData.installationDate && !clientData.paymentDate) {
        const baseDate = new Date(clientData.installationDate);
        baseDate.setMonth(baseDate.getMonth() + 1);
        clientData.paymentDate = new Date(Date.UTC(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          12, 0, 0
        ));
        this.logger.log(`Cliente DNI ${createClientDto.dni} sin adelanto. Próximo pago por inst.: ${clientData.paymentDate}`);
      } else if (clientData.paymentDate) {
        this.logger.log(`Cliente DNI ${createClientDto.dni} sin adelanto. Próximo pago por DTO: ${clientData.paymentDate}`);
      } else {
        this.logger.log(`Cliente DNI ${createClientDto.dni} sin adelanto y sin fecha de instalación/prox.pago. Estado: ${clientData.paymentStatus}`);
      }
    }

    const client = this.clientRepository.create(clientData);
    const savedClient = await this.clientRepository.save(client);
    this.logger.log(`Cliente creado ID ${savedClient.id}, estado inicial: ${savedClient.paymentStatus}, prox. pago: ${savedClient.paymentDate}`);
    return savedClient;
  }

  async findAll(): Promise<Client[]> {
    const clients = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.plan', 'plan')
      .leftJoinAndSelect('plan.service', 'service')
      .leftJoinAndSelect('client.sector', 'sector')
      .getMany();

    return clients;
  }

  async findOne(id: number) {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.plan', 'plan')
      .leftJoinAndSelect('plan.service', 'service')
      .leftJoinAndSelect('client.sector', 'sector')
      .where('client.id = :id', { id })
      .getOne();

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    const estadoGeneralCalculado = await this.getEstadoGeneralCliente(id, client);
    this.logger.debug(`Cliente ID: ${id}, paymentStatus calculado dinámicamente para findOne: ${estadoGeneralCalculado}`);

    // Convertir el estado calculado al enum correspondiente
    let newPaymentStatus: ClientEntityPaymentStatus;
    switch (estadoGeneralCalculado) {
      case 'Al día':
        newPaymentStatus = ClientEntityPaymentStatus.PAID;
        break;
      case 'Por vencer':
        newPaymentStatus = ClientEntityPaymentStatus.EXPIRING;
        break;
      case 'Vencido':
        newPaymentStatus = ClientEntityPaymentStatus.EXPIRED;
        break;
      case 'Suspendido':
        newPaymentStatus = ClientEntityPaymentStatus.SUSPENDED;
        break;
      default:
        newPaymentStatus = ClientEntityPaymentStatus.EXPIRING;
    }

    // Actualizar el estado en la base de datos si ha cambiado
    if (client.paymentStatus !== newPaymentStatus) {
      this.logger.log(`Actualizando estado del cliente ${id} de ${client.paymentStatus} a ${newPaymentStatus}`);
      await this.clientRepository.update(id, { paymentStatus: newPaymentStatus });
      client.paymentStatus = newPaymentStatus;
    }

    return { ...client, paymentStatusString: estadoGeneralCalculado };
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const clientToUpdate = await this.clientRepository.findOne({ where: { id } });
    if (!clientToUpdate) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    Object.assign(clientToUpdate, updateClientDto);

    if (updateClientDto.installationDate) {
      clientToUpdate.installationDate = new Date(`${updateClientDto.installationDate}T12:00:00Z`);
    }
    if (updateClientDto.paymentDate) {
      clientToUpdate.paymentDate = new Date(`${updateClientDto.paymentDate}T12:00:00Z`);
    }
    if (updateClientDto.plan !== undefined) {
      clientToUpdate.plan = { id: updateClientDto.plan } as any;
    }
    if (updateClientDto.sector !== undefined) {
      clientToUpdate.sector = { id: updateClientDto.sector } as any;
    }

    await this.clientRepository.save(clientToUpdate);

    await this.recalculateAndSaveClientPaymentStatus(id);
    this.logger.log(`Cliente ID ${id} actualizado y estado recalculado.`);

    return this.clientRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return await this.clientRepository.remove(client);
  }

  async recalculateAndSaveClientPaymentStatus(clienteId: number): Promise<ClientEntityPaymentStatus> {
    const client = await this.clientRepository.findOne({ where: { id: clienteId } });
    if (!client) {
      this.logger.error(`recalculateAndSave: Cliente ID ${clienteId} no encontrado.`);
      throw new NotFoundException(`Cliente ID ${clienteId} no encontrado para recalcular estado.`);
    }

    const calculatedStatusString = await this.getEstadoGeneralCliente(clienteId, client);
    let newPaymentStatus: ClientEntityPaymentStatus;

    switch (calculatedStatusString) {
      case 'Al día':
        newPaymentStatus = ClientEntityPaymentStatus.PAID;
        break;
      case 'Por vencer':
        newPaymentStatus = ClientEntityPaymentStatus.EXPIRING;
        break;
      case 'Vencido':
        newPaymentStatus = ClientEntityPaymentStatus.EXPIRED;
        break;
      case 'Suspendido':
        newPaymentStatus = ClientEntityPaymentStatus.SUSPENDED;
        break;
      case 'Sin pagos':
        newPaymentStatus = ClientEntityPaymentStatus.EXPIRING;
        break;
      default:
        this.logger.warn(`Estado desconocido "${calculatedStatusString}" para cliente ID ${clienteId}. Usando EXPIRED por defecto.`);
        newPaymentStatus = ClientEntityPaymentStatus.EXPIRED;
    }

    if (client.paymentStatus !== newPaymentStatus) {
      await this.clientRepository.update(clienteId, { paymentStatus: newPaymentStatus });
      this.logger.log(`Estado de pago para cliente ID ${clienteId} actualizado en BD a: ${newPaymentStatus} (antes ${client.paymentStatus})`);
    }
    return newPaymentStatus;
  }

  async getEstadoGeneralCliente(clienteId: number, clientEntity?: Client): Promise<string> {
    const client = clientEntity || await this.clientRepository.findOne({ where: { id: clienteId } });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado para getEstadoGeneralCliente.`);
    }

    const hoy = new Date();
    hoy.setUTCHours(12, 0, 0, 0);

    if (!client.paymentDate) {
      return 'Sin pagos';
    }

    const proximoVencimiento = new Date(client.paymentDate);
    proximoVencimiento.setUTCHours(12, 0, 0, 0);
    const diffDays = Math.floor((proximoVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    this.logger.debug(`Cliente ${clienteId}: Días para vencer: ${diffDays}, Fecha próximo pago: ${proximoVencimiento.toISOString()}, Adelantado: ${client.advancePayment}`);

    // Si tiene renta adelantada, es más flexible con los plazos
    if (client.advancePayment) {
      if (diffDays > 0) {
        return 'Al día';
      } else if (diffDays >= -7) {
        return 'Por vencer';
      }
    }

    // Lógica normal sin renta adelantada
    if (diffDays > 7) {
      return 'Al día';
    } else if (diffDays >= 0) {
      return 'Por vencer';
    } else if (diffDays >= -7) {
      return 'Vencido';
    }
    
    return 'Suspendido';
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronActualizarEstadoClientes() {
    this.logger.log('Ejecutando cron job para actualizar estado de clientes...');
    const clients = await this.clientRepository.find({ select: ['id'] });
    this.logger.log(`Encontrados ${clients.length} clientes para actualizar`);
    
    for (const client of clients) {
      try {
        const estadoAnterior = (await this.clientRepository.findOne({ where: { id: client.id } })).paymentStatus;
        const nuevoEstado = await this.recalculateAndSaveClientPaymentStatus(client.id);
        this.logger.log(`Cliente ID ${client.id}: Estado cambiado de ${estadoAnterior} a ${nuevoEstado}`);
      } catch (error) {
        this.logger.error(`Error al actualizar estado del cliente ID ${client.id} por cron: ${error.message}`, error.stack);
      }
    }
    this.logger.log('Cron job para actualizar estado de clientes finalizado.');
  }

  async getSummary(getClientsSummaryDto: GetClientsSummaryDto) {
    this.logger.log('Obteniendo resumen de clientes');

    const { period } = getClientsSummaryDto;
    let whereConditions: any = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filtrar por período si es necesario
    if (period === 'thisMonth') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      whereConditions.created_at = Between(firstDayOfMonth, today);
    } else if (period === 'last7Days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      whereConditions.created_at = Between(sevenDaysAgo, today);
    } else if (period === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      whereConditions.created_at = Between(today, tomorrow);
    }

    // Obtener todos los clientes
    const allClients = await this.clientRepository.find({
      where: whereConditions
    });

    // Calcular los contadores
    const totalClientes = allClients.length;
    const clientesActivos = allClients.filter(client =>
      client.status === AccountStatus.ACTIVE &&
      client.paymentStatus === ClientEntityPaymentStatus.PAID
    ).length;
    const clientesVencidos = allClients.filter(client =>
      client.paymentStatus === ClientEntityPaymentStatus.EXPIRED ||
      client.paymentStatus === ClientEntityPaymentStatus.SUSPENDED
    ).length;
    const clientesPorVencer = allClients.filter(client =>
      client.paymentStatus === ClientEntityPaymentStatus.EXPIRING
    ).length;

    return {
      totalClientes,
      clientesActivos,
      clientesVencidos,
      clientesPorVencer,
      period: period || 'all'
    };
  }

  async updateClientStatus(clientId: number) {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clientId} no encontrado`);
    }

    const hoy = new Date();
    hoy.setUTCHours(12, 0, 0, 0);

    // Si tiene renta adelantada y fecha de próximo pago
    if (client.advancePayment && client.paymentDate) {
      const proximoPago = new Date(client.paymentDate);
      proximoPago.setUTCHours(12, 0, 0, 0);

      if (proximoPago >= hoy) {
        client.paymentStatus = ClientEntityPaymentStatus.PAID;
      } else {
        const diffDays = Math.floor((proximoPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          client.paymentStatus = ClientEntityPaymentStatus.EXPIRING;
        } else if (diffDays < 0) {
          client.paymentStatus = ClientEntityPaymentStatus.EXPIRED;
        }
      }
    } else if (client.advancePayment) {
      // Si tiene renta adelantada pero no fecha de próximo pago
      client.paymentStatus = ClientEntityPaymentStatus.PAID;
    } else if (client.paymentDate) {
      // Si no tiene renta adelantada pero sí fecha de próximo pago
      const proximoPago = new Date(client.paymentDate);
      proximoPago.setUTCHours(12, 0, 0, 0);
      
      const diffDays = Math.floor((proximoPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 7) {
        client.paymentStatus = ClientEntityPaymentStatus.PAID;
      } else if (diffDays >= 0 && diffDays <= 7) {
        client.paymentStatus = ClientEntityPaymentStatus.EXPIRING;
      } else if (Math.abs(diffDays) > 7) {
        client.paymentStatus = ClientEntityPaymentStatus.SUSPENDED;
      } else {
        client.paymentStatus = ClientEntityPaymentStatus.EXPIRED;
      }
    } else {
      // Si no tiene ni renta adelantada ni fecha de próximo pago
      client.paymentStatus = ClientEntityPaymentStatus.EXPIRING;
    }

    await this.clientRepository.save(client);
    return client;
  }
}