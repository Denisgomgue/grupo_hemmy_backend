/**
 * Servicio para la gestión de clientes
 * Este servicio maneja todas las operaciones relacionadas con los clientes:
 * - CRUD de clientes
 * - Gestión de estados de pago
 * - Gestión de imágenes de referencia
 * - Cálculos automáticos de estados
 */
import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, Between } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, AccountStatus, PaymentStatus as ClientEntityPaymentStatus } from './entities/client.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addMonths, differenceInDays, startOfDay } from 'date-fns';
import { GetClientsSummaryDto } from './dto/get-clients-summary.dto';
import { join } from 'path';
import * as fs from 'fs/promises';

/**
 * Utilidad para convertir diferentes tipos de valores a booleano
 * @param value - Valor a convertir
 * @returns boolean
 */
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

  /**
   * Verifica si un DNI ya existe en la base de datos
   * @param dni - DNI a verificar
   * @param excludeId - ID del cliente a excluir de la búsqueda (para actualizaciones)
   */
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

  /**
   * Calcula el estado de pago según las reglas de negocio
   * @param paymentDate - Fecha de próximo pago
   * @param isAdvancePayment - Si el cliente tiene pago adelantado
   * @returns Object con el estado y descripción
   */
  private calculatePaymentStatus(
    paymentDate: Date | null,
    isAdvancePayment: boolean
  ): { status: ClientEntityPaymentStatus; description: string } {
    const today = startOfDay(new Date());

    // Si no hay fecha de pago
    if (!paymentDate) {
      return {
        status: ClientEntityPaymentStatus.EXPIRING,
        description: 'Sin fecha de pago'
      };
    }

    const paymentDateStart = startOfDay(new Date(paymentDate));
    const daysUntilPayment = differenceInDays(paymentDateStart, today);

    // Lógica para pago adelantado
    if (isAdvancePayment) {
      if (daysUntilPayment > 7) {
        return {
          status: ClientEntityPaymentStatus.PAID,
          description: 'Pagado'
        };
      }
      if (daysUntilPayment >= 0) {
        return {
          status: ClientEntityPaymentStatus.EXPIRING,
          description: 'Por vencer'
        };
      }
    }

    // Lógica para pago normal
    if (daysUntilPayment > 7) {
      return {
        status: ClientEntityPaymentStatus.PAID,
        description: 'Pagado'
      };
    }
    if (daysUntilPayment >= 0) {
      return {
        status: ClientEntityPaymentStatus.EXPIRING,
        description: 'Por vencer'
      };
    }
    if (daysUntilPayment >= -7) {
      return {
        status: ClientEntityPaymentStatus.EXPIRED,
        description: 'Vencido'
      };
    }
    return {
      status: ClientEntityPaymentStatus.SUSPENDED,
      description: 'Suspendido'
    };
  }

  /**
   * Crea un nuevo cliente con manejo de transacciones
   * Incluye validación de DNI y cálculo inicial de estado de pago
   */
  async createWithTransaction(createClientDto: CreateClientDto): Promise<Client> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // Validación de DNI único
      const dniExists = await queryRunner.manager.exists(Client, { where: { dni: createClientDto.dni } });
      if (dniExists) {
        throw new ConflictException(`El DNI ${createClientDto.dni} ya está registrado.`);
      }

      // Preparación de datos del cliente
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

      // Cálculo del estado de pago inicial
      if (createClientDto.paymentDate) {
        const paymentDate = new Date(`${createClientDto.paymentDate}T12:00:00Z`);
        clientData.paymentDate = paymentDate;
        clientData.initialPaymentDate = paymentDate;

        const { status, description } = this.calculatePaymentStatus(
          paymentDate,
          createClientDto.advancePayment
        );

        clientData.paymentStatus = status;
        this.logger.log(`Cliente DNI ${createClientDto.dni} - ${description}. Estado: ${status}`);
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

  /**
   * Busca clientes con filtros y paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @param search - Término de búsqueda
   * @param status - Filtro por estado
   * @param services - Filtro por servicios
   * @param minCost - Costo mínimo
   * @param maxCost - Costo máximo
   * @param sectors - Filtro por sectores
   */
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
      .leftJoinAndSelect('client.sector', 'sector')
      .orderBy('client.created_at', 'DESC');

    // Aplicar filtros de búsqueda
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

  /**
   * Busca un cliente por ID y calcula su estado general
   * @param id - ID del cliente
   */
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

  /**
   * Actualiza un cliente existente
   * Incluye manejo de transacciones y actualización de imágenes
   */
  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const clientToUpdate = await queryRunner.manager.findOne(Client, { where: { id } });
      if (!clientToUpdate) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      // Validación de DNI único
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

      // Actualización de campos básicos
      this.updateBasicFields(clientToUpdate, updateClientDto);

      // Manejo de imagen de referencia
      if (updateClientDto.referenceImage !== clientToUpdate.referenceImage) {
        await this.handleReferenceImageUpdate(clientToUpdate, updateClientDto.referenceImage);
      }

      const savedClient = await queryRunner.manager.save(Client, clientToUpdate);
      await queryRunner.commitTransaction();
      this.logger.log(`Cliente ID ${id} actualizado. DNI: ${savedClient.dni}`);

      // Recálculo de estado
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

  /**
   * Actualiza los campos básicos de un cliente
   * Método auxiliar para update()
   */
  private updateBasicFields(client: Client, updateDto: UpdateClientDto): void {
    client.name = updateDto.name ?? client.name;
    client.lastName = updateDto.lastName ?? client.lastName;
    client.phone = updateDto.phone ?? client.phone;
    client.address = updateDto.address ?? client.address;
    client.reference = updateDto.reference ?? client.reference;
    client.description = updateDto.description ?? client.description;
    client.routerSerial = updateDto.routerSerial ?? client.routerSerial;
    client.decoSerial = updateDto.decoSerial ?? client.decoSerial;

    if ('advancePayment' in updateDto) {
      client.advancePayment = convertToBoolean(updateDto.advancePayment);
    }

    if (updateDto.status) {
      client.status = updateDto.status;
    }

    if (updateDto.installationDate) {
      client.installationDate = new Date(`${updateDto.installationDate}T12:00:00Z`);
    }
    if (updateDto.paymentDate) {
      client.paymentDate = new Date(`${updateDto.paymentDate}T12:00:00Z`);
    }
    if (updateDto.plan !== undefined) {
      client.plan = updateDto.plan ? { id: updateDto.plan } as any : null;
    }
    if (updateDto.sector !== undefined) {
      client.sector = updateDto.sector ? { id: updateDto.sector } as any : null;
    }
  }

  /**
   * Maneja la actualización de la imagen de referencia
   * Método auxiliar para update()
   */
  private async handleReferenceImageUpdate(client: Client, newImagePath: string): Promise<void> {
    if (client.referenceImage) {
      const fullOldPath = join(process.cwd(), client.referenceImage);
      try {
        await fs.unlink(fullOldPath);
        this.logger.log(`Imagen antigua eliminada: ${fullOldPath}`);
      } catch (error) {
        this.logger.warn(`Error al eliminar la imagen antigua ${fullOldPath}: ${error.message}`);
      }
    }
    client.referenceImage = newImagePath;
  }

  /**
   * Elimina un cliente y su imagen de referencia
   */
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

  /**
   * Recalcula y guarda el estado de pago de un cliente
   * Este método es crucial para mantener actualizado el estado de los clientes
   */
  async recalculateAndSaveClientPaymentStatus(clienteId: number): Promise<ClientEntityPaymentStatus> {
    const client = await this.clientRepository.findOne({
      where: { id: clienteId },
      relations: [ 'payments' ]
    });

    if (!client) {
      this.logger.error(`recalculateAndSave: Cliente ID ${clienteId} no encontrado.`);
      throw new NotFoundException(`Cliente ID ${clienteId} no encontrado para recalcular estado.`);
    }

    const { status, description } = this.calculatePaymentStatus(
      client.paymentDate,
      client.advancePayment
    );

    if (client.paymentStatus !== status) {
      const updates: Partial<Client> = {
        paymentStatus: status
      };

      // Si está suspendido, actualizar también el estado de cuenta
      if (status === ClientEntityPaymentStatus.SUSPENDED && client.status !== AccountStatus.SUSPENDED) {
        updates.status = AccountStatus.SUSPENDED;
      }

      await this.clientRepository.update(clienteId, updates);
      this.logger.log(`Estado de cliente ID ${clienteId} actualizado: PaymentStatus=${status}${updates.status ? ', AccountStatus=' + updates.status : ''}`);
    }

    return status;
  }

  /**
   * Calcula el estado general de un cliente
   * Este método proporciona una descripción más detallada del estado
   */
  async getEstadoGeneralCliente(clienteId: number, clientEntity?: Client): Promise<string> {
    const client = clientEntity || await this.clientRepository.findOne({ where: { id: clienteId } });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado para getEstadoGeneralCliente.`);
    }

    const { description } = this.calculatePaymentStatus(
      client.paymentDate,
      client.advancePayment
    );

    return description;
  }

  /**
   * Sincroniza los estados de pago de todos los clientes
   * Este método debe ejecutarse una vez para actualizar los registros existentes
   */
  async syncAllClientsPaymentStatus(): Promise<void> {
    this.logger.log('Iniciando sincronización de estados de pago de todos los clientes...');

    try {
      // Obtener todos los clientes
      const clients = await this.clientRepository.find();
      let updated = 0;
      let unchanged = 0;
      let errors = 0;

      // Procesar cada cliente
      for (const client of clients) {
        try {
          const { status, description } = this.calculatePaymentStatus(
            client.paymentDate,
            client.advancePayment
          );

          // Solo actualizar si el estado ha cambiado
          if (client.paymentStatus !== status) {
            const updates: Partial<Client> = {
              paymentStatus: status
            };

            // Actualizar estado de cuenta si está suspendido
            if (status === ClientEntityPaymentStatus.SUSPENDED &&
              client.status !== AccountStatus.SUSPENDED) {
              updates.status = AccountStatus.SUSPENDED;
            }

            await this.clientRepository.update(client.id, updates);
            this.logger.log(
              `Cliente ID ${client.id} actualizado: ${client.paymentStatus} -> ${status} (${description})`
            );
            updated++;
          } else {
            unchanged++;
          }
        } catch (error) {
          this.logger.error(
            `Error al actualizar cliente ID ${client.id}: ${error.message}`
          );
          errors++;
        }
      }

      this.logger.log(`Sincronización completada:
        - Total clientes: ${clients.length}
        - Actualizados: ${updated}
        - Sin cambios: ${unchanged}
        - Errores: ${errors}`
      );
    } catch (error) {
      this.logger.error('Error durante la sincronización:', error);
      throw new Error('Error durante la sincronización de estados de pago');
    }
  }

  /**
   * Tarea programada para actualizar estados de clientes
   * Se ejecuta todos los días a medianoche
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronActualizarEstadoClientes() {
    this.logger.log('Ejecutando actualización automática de estados de clientes...');
    try {
      await this.syncAllClientsPaymentStatus();
      this.logger.log('Actualización automática completada exitosamente.');
    } catch (error) {
      this.logger.error('Error en la actualización automática:', error);
    }
  }

  /**
   * Obtiene un resumen de los clientes según diferentes períodos
   */
  async getSummary(getClientsSummaryDto: GetClientsSummaryDto) {
    const { period } = getClientsSummaryDto;
    let whereConditions: any = {};

    const today = startOfDay(new Date());

    // Configuración de períodos
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
    }

    const totalSystemClients = await this.clientRepository.count();

    const clientsForPeriod = await this.clientRepository.find({
      where: whereConditions,
      select: [ 'id', 'paymentDate', 'advancePayment' ]
    });

    // Conteo de clientes por estado
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

  /**
   * Actualiza el estado de un cliente específico
   */
  async updateClientStatus(clientId: number) {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clientId} no encontrado`);
    }

    const newStatus = await this.recalculateAndSaveClientPaymentStatus(clientId);
    this.logger.log(`Estado del cliente ${clientId} actualizado a: ${newStatus}`);

    return this.findOne(clientId);
  }

  /**
   * Guarda una nueva imagen de referencia para un cliente
   */
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

  /**
   * Elimina la imagen de referencia de un cliente
   */
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