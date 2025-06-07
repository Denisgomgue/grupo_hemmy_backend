import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, AccountStatus, PaymentStatus as ClientEntityPaymentStatus } from './entities/client.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addMonths, differenceInDays, startOfDay } from 'date-fns';
import { GetClientsSummaryDto } from './dto/get-clients-summary.dto';
import { Between } from 'typeorm';
import { join } from 'path';
import * as fs from 'fs/promises';

const convertToBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  if (typeof value === 'number') return value === 1;
  return false;
};

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);
  private readonly uploadPath = 'uploads/clients';

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly dataSource: DataSource
  ) { }

  async checkDniExists(dni: string, excludeId?: number): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const whereClause: any = { dni };
      if (excludeId) {
        whereClause.id = Not(excludeId);
      }
      const client = await queryRunner.manager.findOne(Client, {
        where: whereClause,
      });

      return !!client;
    } catch (error) {
      this.logger.error(`Error en checkDniExists (DNI: ${dni}, excludeId: ${excludeId}):`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createWithTransaction(createClientDto: CreateClientDto): Promise<Client> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const dniExists = await queryRunner.manager.exists(Client, { where: { dni: createClientDto.dni } });
      if (dniExists) {
        throw new ConflictException(`El DNI ${createClientDto.dni} ya está registrado.`);
      }

      const clientData: Partial<Client> = {
        name: createClientDto.name,
        lastName: createClientDto.lastName,
        dni: createClientDto.dni,
        phone: createClientDto.phone,
        address: createClientDto.address,
        reference: createClientDto.reference,
        advancePayment: createClientDto.advancePayment ?? false,
        status: createClientDto.status || AccountStatus.ACTIVE,
        description: createClientDto.description,
        routerSerial: createClientDto.routerSerial,
        decoSerial: createClientDto.decoSerial,
        plan: createClientDto.plan ? { id: createClientDto.plan } as any : null,
        sector: createClientDto.sector ? { id: createClientDto.sector } as any : null,
        installationDate: createClientDto.installationDate ? new Date(`${createClientDto.installationDate}T12:00:00Z`) : null,
        referenceImage: createClientDto.referenceImage
      };

      if (createClientDto.paymentDate) {
        const paymentDate = new Date(`${createClientDto.paymentDate}T12:00:00Z`);
        clientData.paymentDate = paymentDate;
        clientData.initialPaymentDate = paymentDate;

        const today = startOfDay(new Date());

        if (createClientDto.advancePayment) {
          clientData.paymentStatus = ClientEntityPaymentStatus.PAID;
          this.logger.log(`Cliente DNI ${createClientDto.dni} con pago adelantado. Estado: PAID`);
        } else {
          const daysUntilPayment = differenceInDays(paymentDate, today);

          if (daysUntilPayment < 0) {
            clientData.paymentStatus = ClientEntityPaymentStatus.EXPIRED;
            this.logger.log(`Cliente DNI ${createClientDto.dni} con fecha vencida. Estado: EXPIRED`);
          } else if (daysUntilPayment <= 7) {
            clientData.paymentStatus = ClientEntityPaymentStatus.EXPIRING;
            this.logger.log(`Cliente DNI ${createClientDto.dni} próximo a vencer. Estado: EXPIRING`);
          } else {
            clientData.paymentStatus = ClientEntityPaymentStatus.PAID;
            this.logger.log(`Cliente DNI ${createClientDto.dni} al día. Estado: PAID`);
          }
        }
      } else {
        clientData.paymentStatus = ClientEntityPaymentStatus.EXPIRING;
        this.logger.warn(`Cliente DNI ${createClientDto.dni} sin fecha de próximo pago. Estado: EXPIRING`);
      }

      const client = queryRunner.manager.create(Client, clientData);
      const savedClient = await queryRunner.manager.save(Client, client);
      await queryRunner.commitTransaction();
      this.logger.log(`Cliente creado ID ${savedClient.id}, DNI: ${savedClient.dni}`);
      return savedClient;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(`Error en createWithTransaction (DNI: ${createClientDto.dni}):`, error);
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Error al crear el cliente debido a un conflicto de datos o error interno.');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string[],
    services?: string[],
    minCost?: number,
    maxCost?: number,
    sectors?: string[]
  ): Promise<{ data: Client[], total: number }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.plan', 'plan')
      .leftJoinAndSelect('plan.service', 'service')
      .leftJoinAndSelect('client.sector', 'sector');

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(client.name) LIKE LOWER(:search) OR ' +
        'LOWER(client.lastName) LIKE LOWER(:search) OR ' +
        'client.dni LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status && status.length > 0) {
      queryBuilder.andWhere('client.paymentStatus IN (:...status)', { status });
    }

    if (services && services.length > 0) {
      queryBuilder.andWhere('service.id IN (:...services)', {
        services: services.map(id => parseInt(id, 10))
      });
    }

    if (minCost !== undefined && maxCost !== undefined) {
      queryBuilder.andWhere('plan.price BETWEEN :minCost AND :maxCost', {
        minCost,
        maxCost
      });
    }

    if (sectors && sectors.length > 0) {
      queryBuilder.andWhere('sector.id IN (:...sectors)', {
        sectors: sectors.map(id => parseInt(id, 10))
      });
    }

    const [ clients, total ] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: clients,
      total
    };
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

    return { ...client, paymentStatusString: estadoGeneralCalculado };
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const clientToUpdate = await queryRunner.manager.findOne(Client, { where: { id } });
      if (!clientToUpdate) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      if (updateClientDto.dni && updateClientDto.dni !== clientToUpdate.dni) {
        const dniExistsInOtherClient = await queryRunner.manager.exists(Client, {
          where: {
            dni: updateClientDto.dni,
            id: Not(id)
          }
        });
        if (dniExistsInOtherClient) {
          throw new ConflictException(`El DNI ${updateClientDto.dni} ya está registrado para otro cliente.`);
        }
        clientToUpdate.dni = updateClientDto.dni;
      }

      clientToUpdate.name = updateClientDto.name ?? clientToUpdate.name;
      clientToUpdate.lastName = updateClientDto.lastName ?? clientToUpdate.lastName;
      clientToUpdate.phone = updateClientDto.phone ?? clientToUpdate.phone;
      clientToUpdate.address = updateClientDto.address ?? clientToUpdate.address;
      clientToUpdate.reference = updateClientDto.reference ?? clientToUpdate.reference;

      // Manejar advancePayment usando la función auxiliar
      if ('advancePayment' in updateClientDto) {
        const boolValue = convertToBoolean(updateClientDto.advancePayment);
        clientToUpdate.advancePayment = boolValue;
        this.logger.log(`Actualizando advancePayment:`, {
          valorRecibido: updateClientDto.advancePayment,
          tipo: typeof updateClientDto.advancePayment,
          valorFinal: boolValue
        });
      }

      if (updateClientDto.status) {
        clientToUpdate.status = updateClientDto.status;
      }
      clientToUpdate.description = updateClientDto.description ?? clientToUpdate.description;
      clientToUpdate.routerSerial = updateClientDto.routerSerial ?? clientToUpdate.routerSerial;
      clientToUpdate.decoSerial = updateClientDto.decoSerial ?? clientToUpdate.decoSerial;

      if (updateClientDto.installationDate) {
        clientToUpdate.installationDate = new Date(`${updateClientDto.installationDate}T12:00:00Z`);
      }
      if (updateClientDto.paymentDate) {
        clientToUpdate.paymentDate = new Date(`${updateClientDto.paymentDate}T12:00:00Z`);
      }
      if (updateClientDto.plan !== undefined) {
        clientToUpdate.plan = updateClientDto.plan ? { id: updateClientDto.plan } as any : null;
      }
      if (updateClientDto.sector !== undefined) {
        clientToUpdate.sector = updateClientDto.sector ? { id: updateClientDto.sector } as any : null;
      }

      const newImagePath = updateClientDto.referenceImage;
      const oldImagePath = clientToUpdate.referenceImage;

      if (newImagePath !== oldImagePath) {
        if (oldImagePath) {
          const fullOldPath = join(process.cwd(), oldImagePath);
          try {
            await fs.unlink(fullOldPath);
            this.logger.log(`Imagen antigua eliminada: ${fullOldPath}`);
          } catch (error) {
            this.logger.warn(`Error al eliminar la imagen antigua ${fullOldPath}: ${error.message}`);
          }
        }
        clientToUpdate.referenceImage = newImagePath;
      }

      const savedClient = await queryRunner.manager.save(Client, clientToUpdate);
      await queryRunner.commitTransaction();
      this.logger.log(`Cliente ID ${id} actualizado. DNI: ${savedClient.dni}`);

      try {
        await this.recalculateAndSaveClientPaymentStatus(id);
        this.logger.log(`Estado del cliente ID ${id} recalculado post-actualización.`);
      } catch (recalcError) {
        this.logger.error(`Error al recalcular estado para cliente ID ${id} post-actualización:`, recalcError);
      }

      return this.findOne(id);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(`Error en update (ID: ${id}):`, error);
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Error al actualizar el cliente debido a un conflicto de datos o error interno.');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    if (client.referenceImage) {
      const imagePath = join(process.cwd(), client.referenceImage);
      try {
        await fs.unlink(imagePath);
        this.logger.log(`Imagen de referencia eliminada para cliente ID ${id}: ${imagePath}`);
      } catch (error) {
        this.logger.warn(`Error al eliminar imagen de referencia para cliente ID ${id}: ${error.message}`);
      }
    }
    return await this.clientRepository.remove(client);
  }

  async recalculateAndSaveClientPaymentStatus(clienteId: number): Promise<ClientEntityPaymentStatus> {
    const client = await this.clientRepository.findOne({
      where: { id: clienteId },
      relations: [ 'payments' ]
    });

    if (!client) {
      this.logger.error(`recalculateAndSave: Cliente ID ${clienteId} no encontrado.`);
      throw new NotFoundException(`Cliente ID ${clienteId} no encontrado para recalcular estado.`);
    }

    const lastPayment = client.payments
      ?.sort((a, b) => (b.paymentDate?.getTime() || 0) - (a.paymentDate?.getTime() || 0))
      ?.[ 0 ];

    const today = startOfDay(new Date());

    let newPaymentStatus: ClientEntityPaymentStatus;
    let shouldUpdateAccountStatus = false;

    if (client.paymentDate) {
      const paymentDateAtStartOfDay = startOfDay(new Date(client.paymentDate));
      const daysUntilPayment = differenceInDays(paymentDateAtStartOfDay, today);
      const isPaymentLate = lastPayment && lastPayment.state === PaymentStatus.LATE_PAYMENT;

      if (daysUntilPayment < -30) {
        newPaymentStatus = ClientEntityPaymentStatus.SUSPENDED;
        shouldUpdateAccountStatus = true;
      } else if (daysUntilPayment < 0 || isPaymentLate) {
        newPaymentStatus = ClientEntityPaymentStatus.EXPIRED;
      } else if (daysUntilPayment <= 7) {
        newPaymentStatus = ClientEntityPaymentStatus.EXPIRING;
      } else {
        newPaymentStatus = ClientEntityPaymentStatus.PAID;
      }
    } else {
      newPaymentStatus = ClientEntityPaymentStatus.EXPIRING;
    }

    if (client.paymentStatus !== newPaymentStatus || shouldUpdateAccountStatus) {
      const updates: Partial<Client> = {
        paymentStatus: newPaymentStatus
      };
      if (shouldUpdateAccountStatus && client.status !== AccountStatus.SUSPENDED) {
        updates.status = AccountStatus.SUSPENDED;
      }
      if (Object.keys(updates).length > 0) {
        await this.clientRepository.update(clienteId, updates);
        this.logger.log(`Estado de cliente ID ${clienteId} actualizado: PaymentStatus=${newPaymentStatus}${updates.status ? ', AccountStatus=' + updates.status : ''}`);
      }
    }
    return newPaymentStatus;
  }

  async getEstadoGeneralCliente(clienteId: number, clientEntity?: Client): Promise<string> {
    const client = clientEntity || await this.clientRepository.findOne({ where: { id: clienteId } });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado para getEstadoGeneralCliente.`);
    }

    const hoy = startOfDay(new Date());

    if (client.advancePayment && client.paymentDate) {
      const proximoVencimientoAdelantado = startOfDay(new Date(client.paymentDate));
      if (proximoVencimientoAdelantado >= hoy) {
        const diffDaysAdelantado = differenceInDays(proximoVencimientoAdelantado, hoy);
        if (diffDaysAdelantado > 7) return 'Al día';
        if (diffDaysAdelantado >= 0) return 'Por vencer';
      }
    } else if (client.advancePayment && !client.paymentDate) {
      return 'Al día';
    }

    if (!client.paymentDate) {
      return 'Sin fecha de pago';
    }

    const proximoVencimiento = startOfDay(new Date(client.paymentDate));
    const diffDays = differenceInDays(proximoVencimiento, hoy);

    if (diffDays > 7) return 'Al día';
    if (diffDays >= 0) return 'Por vencer';
    if (diffDays < -30) return 'Suspendido';
    return 'Vencido';
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronActualizarEstadoClientes() {
    this.logger.log('Ejecutando cron job para actualizar estado de clientes...');
    const clients = await this.clientRepository.find({ select: [ 'id' ] });
    for (const client of clients) {
      try {
        await this.recalculateAndSaveClientPaymentStatus(client.id);
      } catch (error) {
        this.logger.error(`Error al actualizar estado del cliente ID ${client.id} por cron: ${error.message}`, error.stack);
      }
    }
    this.logger.log('Cron job para actualizar estado de clientes finalizado.');
  }

  async getSummary(getClientsSummaryDto: GetClientsSummaryDto) {
    const { period } = getClientsSummaryDto;
    let whereConditions: any = {};

    const today = startOfDay(new Date());

    if (period === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      whereConditions.created_at = Between(today, tomorrow);
    } else if (period === 'thisMonth') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      whereConditions.created_at = Between(firstDayOfMonth, lastDayOfMonth);
    } else if (period === 'last7Days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      const dayAfterToday = new Date(today);
      dayAfterToday.setDate(today.getDate() + 1);
      whereConditions.created_at = Between(sevenDaysAgo, dayAfterToday);
    } else {
      // Si no hay periodo específico, o es 'allTime', no aplicar filtro de fecha de creación
    }

    const totalSystemClients = await this.clientRepository.count();

    const clientsForPeriod = await this.clientRepository.find({
      where: whereConditions,
      select: [ 'id', 'paymentDate', 'advancePayment' ]
    });

    let clientesActivos = 0;
    let clientesVencidos = 0;
    let clientesPorVencer = 0;
    let clientesSuspendidos = 0;

    const allClientsForStatus = await this.clientRepository.find({ select: [ 'id', 'paymentDate', 'advancePayment' ] });

    for (const client of allClientsForStatus) {
      const estadoGeneral = await this.getEstadoGeneralCliente(client.id, client as Client);
      switch (estadoGeneral) {
        case 'Al día':
          clientesActivos++;
          break;
        case 'Vencido':
          clientesVencidos++;
          break;
        case 'Por vencer':
          clientesPorVencer++;
          break;
        case 'Suspendido':
          clientesSuspendidos++;
          break;
      }
    }

    return {
      totalClientes: totalSystemClients,
      clientesActivos,
      clientesVencidos,
      clientesPorVencer,
      clientesSuspendidos,
      period: period || 'allTime'
    };
  }

  async updateClientStatus(clientId: number) {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clientId} no encontrado`);
    }

    const newStatus = await this.recalculateAndSaveClientPaymentStatus(clientId);
    this.logger.log(`Estado del cliente ${clientId} actualizado a: ${newStatus}`);

    return this.findOne(clientId);
  }

  async saveImage(clientId: number, filename: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clientId} no encontrado`);
    }

    if (client.referenceImage) {
      const oldImagePath = join(process.cwd(), client.referenceImage);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        this.logger.warn('Error al eliminar la imagen anterior:', error.message);
      }
    }

    client.referenceImage = filename;
    return this.clientRepository.save(client);
  }

  async deleteImage(clientId: number): Promise<void> {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client || !client.referenceImage) {
      this.logger.warn(`Intento de eliminar imagen para cliente ID ${clientId} sin imagen existente.`);
      return;
    }

    const imagePath = join(process.cwd(), client.referenceImage);
    try {
      await fs.unlink(imagePath);
      this.logger.log(`Imagen eliminada: ${imagePath}`);
    } catch (error) {
      this.logger.error(`Error al eliminar el archivo ${imagePath}:`, error);
    }

    client.referenceImage = null;
    await this.clientRepository.save(client);
    this.logger.log(`Referencia de imagen eliminada para cliente ID ${clientId}`);
  }
}