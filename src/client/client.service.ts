/**
 * Servicio para la gestión de clientes - Versión simplificada SIN workflow
 * Este servicio maneja todas las operaciones relacionadas con los clientes:
 * - CRUD de clientes
 * - Gestión de estados de pago a través de installations
 * - Gestión de instalaciones
 * - Gestión de configuraciones de pago
 */
import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, Between } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, AccountStatus } from './entities/client.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Installation, InstallationStatus } from '../installations/entities/installation.entity';
import { ClientPaymentConfig, PaymentStatus as ClientPaymentStatus, PaymentConfigStatus } from '../client-payment-config/entities/client-payment-config.entity';
import { Device } from '../devices/entities/device.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addMonths, differenceInDays, startOfDay } from 'date-fns';
import { GetClientsSummaryDto } from './dto/get-clients-summary.dto';
import { join } from 'path';
import * as fs from 'fs/promises';
import { Plan } from '../plans/entities/plan.entity';
import { Sector } from '../sectors/entities/sector.entity';
import { parseDateString } from '../utils/date.utils';

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
    @InjectRepository(Installation)
    private readonly installationRepository: Repository<Installation>,
    @InjectRepository(ClientPaymentConfig)
    private readonly clientPaymentConfigRepository: Repository<ClientPaymentConfig>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
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
   * Valida si un DNI está disponible
   * @param dni - DNI a validar
   * @param excludeId - ID del cliente a excluir
   * @returns boolean - true si está disponible, false si ya existe
   */
  async validateDni(dni: string, excludeId?: number): Promise<boolean> {
    const exists = await this.checkDniExists(dni, excludeId);
    return !exists; // true = válido, false = ya existe
  }

  /**
   * Busca un cliente por DNI
   * @param dni - DNI del cliente a buscar
   * @returns Cliente encontrado o null
   */
  async findByDni(dni: string): Promise<Client | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const client = await queryRunner.manager.findOne(Client, {
        where: { dni },
        relations: [ 'installations', 'installations.plan', 'installations.sector', 'installations.paymentConfig', 'devices' ],
        select: [ 'id', 'name', 'lastName', 'dni', 'phone', 'address', 'status', 'birthdate', 'description' ]
      });

      return client;
    } catch (error) {
      this.logger.error(`Error en findByDni (DNI: ${dni}):`, error);
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
  ): { status: ClientPaymentStatus; description: string } {
    const today = startOfDay(new Date());

    // Si no hay fecha de pago
    if (!paymentDate) {
      return {
        status: ClientPaymentStatus.EXPIRING,
        description: 'Sin fecha de pago'
      };
    }

    const paymentDateStart = startOfDay(new Date(paymentDate));
    const daysUntilPayment = differenceInDays(paymentDateStart, today);

    // Lógica para pago adelantado
    if (isAdvancePayment) {
      if (daysUntilPayment > 7) {
        return {
          status: ClientPaymentStatus.PAID,
          description: 'Pagado'
        };
      }
      if (daysUntilPayment >= 0) {
        return {
          status: ClientPaymentStatus.EXPIRING,
          description: 'Por vencer'
        };
      }
    }

    // Lógica para pago normal
    if (daysUntilPayment > 7) {
      return {
        status: ClientPaymentStatus.PAID,
        description: 'Pagado'
      };
    }
    if (daysUntilPayment >= 0) {
      return {
        status: ClientPaymentStatus.EXPIRING,
        description: 'Por vencer'
      };
    }
    if (daysUntilPayment >= -7) {
      return {
        status: ClientPaymentStatus.EXPIRED,
        description: 'Vencido'
      };
    }
    return {
      status: ClientPaymentStatus.SUSPENDED,
      description: 'Suspendido'
    };
  }

  /**
   * Crea un nuevo cliente con manejo de transacciones
   * Incluye validación de DNI y creación de instalación y configuración de pago
   */
  async create(createClientDto: CreateClientDto): Promise<Client> {
    // Crear cliente

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
        status: createClientDto.status || AccountStatus.ACTIVE,
        description: createClientDto.description,
        birthdate: createClientDto.birthdate ? new Date(createClientDto.birthdate) : undefined,
      };

      // Crear el cliente
      const client = queryRunner.manager.create(Client, clientData);
      const savedClient = await queryRunner.manager.save(Client, client);

      // Crear instalación si se proporcionan datos
      if (createClientDto.planId && createClientDto.sectorId) {
        const plan = await this.planRepository.findOne({ where: { id: createClientDto.planId } });
        if (!plan) {
          throw new NotFoundException(`Plan con ID ${createClientDto.planId} no encontrado`);
        }

        const sector = await this.sectorRepository.findOne({ where: { id: createClientDto.sectorId } });
        if (!sector) {
          throw new NotFoundException(`Sector con ID ${createClientDto.sectorId} no encontrado`);
        }

        const installationData: Partial<Installation> = {
          client: savedClient,
          installationDate: createClientDto.installationDate ? parseDateString(createClientDto.installationDate) : new Date(),
          reference: createClientDto.reference,
          ipAddress: createClientDto.ipAddress,
          referenceImage: createClientDto.referenceImage,
          plan,
          sector,
          status: InstallationStatus.ACTIVE,
        };

        const installation = queryRunner.manager.create(Installation, installationData);
        const savedInstallation = await queryRunner.manager.save(Installation, installation);

        // Crear configuración de pago si se proporcionan datos
        if (createClientDto.paymentDate !== undefined || createClientDto.advancePayment !== undefined) {
          const { status: paymentStatus } = this.calculatePaymentStatus(
            createClientDto.paymentDate ? parseDateString(createClientDto.paymentDate) : null,
            createClientDto.advancePayment === true
          );

          // Debug: Log del valor de advancePayment recibido
          // Preparar datos de configuración de pagos

          const paymentConfigData: Partial<ClientPaymentConfig> = {
            installationId: savedInstallation.id,
            initialPaymentDate: createClientDto.paymentDate ? parseDateString(createClientDto.paymentDate) : null,
            advancePayment: createClientDto.advancePayment === true,
            paymentStatus: paymentStatus,
            status: PaymentConfigStatus.ACTIVE,
          };



          // Guardar configuración de pagos

          const paymentConfig = queryRunner.manager.create(ClientPaymentConfig, paymentConfigData);
          await queryRunner.manager.save(ClientPaymentConfig, paymentConfig);
        }

        // Crear dispositivos si se proporcionan
        if (createClientDto.routerSerial) {
          const routerDevice: Partial<Device> = {
            serialNumber: createClientDto.routerSerial,
            type: 'router' as any,
            status: 'ASSIGNED' as any,
            useType: 'CLIENT' as any,
            assignedClientId: savedClient.id,
            assignedInstallationId: savedInstallation.id,
          };
          await queryRunner.manager.save(Device, queryRunner.manager.create(Device, routerDevice));
        }

        if (createClientDto.decoSerial) {
          const decoDevice: Partial<Device> = {
            serialNumber: createClientDto.decoSerial,
            type: 'deco' as any,
            status: 'ASSIGNED' as any,
            useType: 'CLIENT' as any,
            assignedClientId: savedClient.id,
            assignedInstallationId: savedInstallation.id,
          };
          await queryRunner.manager.save(Device, queryRunner.manager.create(Device, decoDevice));
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Cliente creado ID ${savedClient.id}, DNI: ${savedClient.dni}`);
      return savedClient;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(`Error en create:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Busca todos los clientes con paginación y filtros
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
    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.installations', 'installations')
      .leftJoinAndSelect('installations.plan', 'plan')
      .leftJoinAndSelect('plan.service', 'service')
      .leftJoinAndSelect('installations.sector', 'sector')
      .leftJoinAndSelect('installations.paymentConfig', 'paymentConfig')
      .leftJoinAndSelect('client.devices', 'devices')
      .leftJoinAndSelect('client.payments', 'payments', 'payments.isVoided = :isVoided', { isVoided: false });

    // 🎯 SOLUCIÓN: Aplicar filtros ANTES de la paginación
    if (search) {
      queryBuilder.andWhere(
        '(client.name LIKE :search OR client.lastName LIKE :search OR client.dni LIKE :search OR client.phone LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status && status.length > 0) {
      queryBuilder.andWhere('client.status IN (:...status)', { status });
    }

    if (sectors && sectors.length > 0) {
      queryBuilder.andWhere('sector.id IN (:...sectors)', { sectors });
    }

    // 🎯 SOLUCIÓN: Contar total ANTES de aplicar paginación
    const total = await queryBuilder.getCount();

    // 🎯 SOLUCIÓN: Aplicar paginación DESPUÉS de los filtros
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Ordenamiento
    queryBuilder.orderBy('client.created_at', 'DESC');

    const data = await queryBuilder.getMany();

    return { data, total };
  }

  /**
   * Busca un cliente por ID
   */
  async findOne(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: [ 'installations', 'installations.plan', 'installations.sector', 'installations.paymentConfig', 'devices', 'payments' ],
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return client;
  }

  /**
   * Actualiza un cliente
   */
  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar DNI único (excluyendo el cliente actual)
      if (updateClientDto.dni && updateClientDto.dni !== client.dni) {
        const dniExists = await queryRunner.manager.exists(Client, {
          where: { dni: updateClientDto.dni, id: Not(id) }
        });
        if (dniExists) {
          throw new ConflictException(`El DNI ${updateClientDto.dni} ya está registrado.`);
        }
      }

      // Actualizar campos básicos del cliente
      this.updateBasicFields(client, updateClientDto);
      const updatedClient = await queryRunner.manager.save(Client, client);

      // Actualizar instalación si se proporcionan datos
      const installation = await this.installationRepository.findOne({
        where: { client: { id } }
      });

      if (installation && (updateClientDto.planId || updateClientDto.sectorId || updateClientDto.installationDate || updateClientDto.reference || updateClientDto.ipAddress)) {
        if (updateClientDto.planId) {
          const plan = await this.planRepository.findOne({ where: { id: updateClientDto.planId } });
          if (!plan) {
            throw new NotFoundException(`Plan con ID ${updateClientDto.planId} no encontrado`);
          }
          installation.plan = plan;
        }

        if (updateClientDto.sectorId) {
          const sector = await this.sectorRepository.findOne({ where: { id: updateClientDto.sectorId } });
          if (!sector) {
            throw new NotFoundException(`Sector con ID ${updateClientDto.sectorId} no encontrado`);
          }
          installation.sector = sector;
        }

        if (updateClientDto.installationDate) {
          installation.installationDate = parseDateString(updateClientDto.installationDate);
        }

        if (updateClientDto.reference !== undefined) {
          installation.reference = updateClientDto.reference;
        }

        if (updateClientDto.ipAddress !== undefined) {
          installation.ipAddress = updateClientDto.ipAddress;
        }

        if (updateClientDto.referenceImage) {
          installation.referenceImage = updateClientDto.referenceImage;
        }

        await queryRunner.manager.save(Installation, installation);
      }

      // Actualizar configuración de pago si se proporcionan datos
      if (installation && (updateClientDto.paymentDate !== undefined || updateClientDto.advancePayment !== undefined)) {
        const paymentConfig = await this.clientPaymentConfigRepository.findOne({
          where: { installationId: installation.id }
        });

        if (paymentConfig) {
          if (updateClientDto.paymentDate !== undefined) {
            paymentConfig.initialPaymentDate = updateClientDto.paymentDate ? new Date(updateClientDto.paymentDate) : null;
          }

          if (updateClientDto.advancePayment !== undefined) {
            paymentConfig.advancePayment = updateClientDto.advancePayment;
          }

          const { status: paymentStatus } = this.calculatePaymentStatus(
            paymentConfig.initialPaymentDate,
            paymentConfig.advancePayment
          );

          paymentConfig.paymentStatus = paymentStatus;
          await queryRunner.manager.save(ClientPaymentConfig, paymentConfig);
        }
      }

      await queryRunner.commitTransaction();
      return updatedClient;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(`Error en update:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Actualiza los campos básicos del cliente
   */
  private updateBasicFields(client: Client, updateDto: UpdateClientDto): void {
    if (updateDto.name !== undefined) {
      client.name = updateDto.name;
    }
    if (updateDto.lastName !== undefined) {
      client.lastName = updateDto.lastName;
    }
    if (updateDto.dni !== undefined) {
      client.dni = updateDto.dni;
    }
    if (updateDto.phone !== undefined) {
      client.phone = updateDto.phone;
    }
    if (updateDto.address !== undefined) {
      client.address = updateDto.address;
    }
    if (updateDto.description !== undefined) {
      client.description = updateDto.description;
    }
    if (updateDto.birthdate !== undefined) {
      client.birthdate = updateDto.birthdate ? new Date(updateDto.birthdate) : undefined;
    }
    if (updateDto.status !== undefined) {
      client.status = updateDto.status;
    }
  }

  /**
   * Elimina un cliente
   */
  async remove(id: number) {
    const client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // Eliminar imagen de referencia si existe
    const installation = await this.installationRepository.findOne({
      where: { client: { id } }
    });

    if (installation && installation.referenceImage) {
      try {
        const imagePath = join(process.cwd(), installation.referenceImage);
        await fs.unlink(imagePath);
      } catch (error) {
        this.logger.warn(`No se pudo eliminar la imagen: ${error.message}`);
      }
    }

    await this.clientRepository.remove(client);
    return { message: 'Cliente eliminado correctamente' };
  }

  /**
   * Recalcula y guarda el estado de pago de un cliente
   */
  async recalculateAndSaveClientPaymentStatus(clienteId: number): Promise<ClientPaymentStatus> {
    const client = await this.findOne(clienteId);
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    // Obtener configuración de pago
    const installation = await this.installationRepository.findOne({
      where: { client: { id: clienteId } },
      relations: [ 'paymentConfig' ]
    });

    if (!installation || !installation.paymentConfig) {
      return ClientPaymentStatus.EXPIRING;
    }

    const { status } = this.calculatePaymentStatus(
      installation.paymentConfig.initialPaymentDate,
      installation.paymentConfig.advancePayment
    );

    // Actualizar el estado en la configuración de pago
    installation.paymentConfig.paymentStatus = status;
    await this.clientPaymentConfigRepository.save(installation.paymentConfig);

    return status;
  }

  /**
   * Obtiene el estado general de un cliente
   */
  async getEstadoGeneralCliente(clienteId: number, clientEntity?: Client): Promise<string> {
    const client = clientEntity || await this.findOne(clienteId);
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    const installation = await this.installationRepository.findOne({
      where: { client: { id: clienteId } },
      relations: [ 'paymentConfig' ]
    });

    if (!installation || !installation.paymentConfig) {
      return `Cliente: ${client.name} ${client.lastName} - Estado: Sin configuración de pago`;
    }

    return `Cliente: ${client.name} ${client.lastName} - Estado: ${installation.paymentConfig.paymentStatus} - Fecha de pago: ${installation.paymentConfig.initialPaymentDate}`;
  }

  /**
   * Sincroniza el estado de pago de todos los clientes
   */
  async syncAllClientsPaymentStatus(): Promise<void> {
    const installations = await this.installationRepository.find({
      relations: [ 'paymentConfig', 'client' ]
    });

    for (const installation of installations) {
      if (installation.paymentConfig) {
        try {
          const { status } = this.calculatePaymentStatus(
            installation.paymentConfig.initialPaymentDate,
            installation.paymentConfig.advancePayment
          );

          installation.paymentConfig.paymentStatus = status;
          await this.clientPaymentConfigRepository.save(installation.paymentConfig);
        } catch (error) {
          this.logger.error(`Error sincronizando cliente ${installation.client.id}:`, error);
        }
      }
    }
  }

  /**
   * Tarea programada para actualizar estados de clientes
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronActualizarEstadoClientes() {
    this.logger.log('Iniciando actualización automática de estados de clientes...');
    await this.syncAllClientsPaymentStatus();
    this.logger.log('Actualización automática de estados de clientes completada.');
  }

  /**
   * Obtiene un resumen de clientes
   */
  async getSummary(getClientsSummaryDto: GetClientsSummaryDto) {
    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.installations', 'installations')
      .leftJoinAndSelect('installations.paymentConfig', 'paymentConfig');

    // Aplicar filtros de fecha
    if (getClientsSummaryDto.startDate && getClientsSummaryDto.endDate) {
      queryBuilder.andWhere('client.created_at BETWEEN :startDate AND :endDate', {
        startDate: getClientsSummaryDto.startDate,
        endDate: getClientsSummaryDto.endDate
      });
    }

    const clients = await queryBuilder.getMany();

    // Calcular estadísticas
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === AccountStatus.ACTIVE).length;
    const suspendedClients = clients.filter(c => c.status === AccountStatus.SUSPENDED).length;
    const inactiveClients = clients.filter(c => c.status === AccountStatus.INACTIVE).length;

    // Contar estados de pago desde las instalaciones
    let paidClients = 0;
    let expiringClients = 0;
    let expiredClients = 0;
    let suspendedPaymentClients = 0;

    for (const client of clients) {
      for (const installation of client.installations) {
        if (installation.paymentConfig) {
          switch (installation.paymentConfig.paymentStatus) {
            case ClientPaymentStatus.PAID:
              paidClients++;
              break;
            case ClientPaymentStatus.EXPIRING:
              expiringClients++;
              break;
            case ClientPaymentStatus.EXPIRED:
              expiredClients++;
              break;
            case ClientPaymentStatus.SUSPENDED:
              suspendedPaymentClients++;
              break;
          }
        }
      }
    }

    return {
      totalClients,
      activeClients,
      suspendedClients,
      inactiveClients,
      paidClients,
      expiringClients,
      expiredClients,
      suspendedPaymentClients
    };
  }

  /**
   * Actualiza el estado de un cliente
   */
  async updateClientStatus(clientId: number) {
    const client = await this.findOne(clientId);
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clientId} no encontrado`);
    }

    await this.recalculateAndSaveClientPaymentStatus(clientId);
    return await this.findOne(clientId);
  }

  /**
   * Guarda una imagen de referencia para un cliente
   */
  async saveImage(clientId: number, filename: string): Promise<Client> {
    const client = await this.findOne(clientId);
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clientId} no encontrado`);
    }

    const installation = await this.installationRepository.findOne({
      where: { client: { id: clientId } }
    });

    if (!installation) {
      throw new NotFoundException(`Instalación no encontrada para el cliente ${clientId}`);
    }

    // Eliminar imagen anterior si existe
    if (installation.referenceImage) {
      try {
        const oldImagePath = join(process.cwd(), installation.referenceImage);
        await fs.unlink(oldImagePath);
      } catch (error) {
        this.logger.warn(`No se pudo eliminar la imagen anterior: ${error.message}`);
      }
    }

    installation.referenceImage = filename;
    await this.installationRepository.save(installation);

    return client;
  }

  /**
   * Elimina la imagen de referencia de un cliente
   */
  async deleteImage(clientId: number): Promise<void> {
    const client = await this.findOne(clientId);
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clientId} no encontrado`);
    }

    const installation = await this.installationRepository.findOne({
      where: { client: { id: clientId } }
    });

    if (!installation || !installation.referenceImage) {
      throw new NotFoundException(`No se encontró imagen de referencia para el cliente ${clientId}`);
    }

    const imagePath = join(process.cwd(), installation.referenceImage);
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      this.logger.error(`Error eliminando imagen: ${error.message}`);
      throw new Error('No se pudo eliminar la imagen');
    }

    installation.referenceImage = null;
    await this.installationRepository.save(installation);
  }
} 