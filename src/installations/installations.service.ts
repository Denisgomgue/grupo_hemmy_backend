import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Installation } from './entities/installation.entity';
import { CreateInstallationDto } from './dto/create-installation.dto';
import { UpdateInstallationDto } from './dto/update-installation.dto';
import { Client } from '../client/entities/client.entity';
import { ClientPaymentConfig, PaymentStatus } from '../client-payment-config/entities/client-payment-config.entity';
import { Device } from '../devices/entities/device.entity';
import { Plan } from '../plans/entities/plan.entity';
import { Sector } from '../sectors/entities/sector.entity';
import { addMonths, differenceInDays, startOfDay } from 'date-fns';

@Injectable()
export class InstallationsService {
    private readonly logger = new Logger(InstallationsService.name);

    constructor(
        @InjectRepository(Installation)
        private readonly installationRepository: Repository<Installation>,
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
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
     * Calcula el estado de pago según las reglas de negocio
     */
    private calculatePaymentStatus(
        paymentDate: Date | null,
        isAdvancePayment: boolean
    ): { status: PaymentStatus; description: string } {
        const today = startOfDay(new Date());

        if (!paymentDate) {
            return {
                status: PaymentStatus.EXPIRING,
                description: 'Sin fecha de pago'
            };
        }

        const paymentDateStart = startOfDay(new Date(paymentDate));
        const daysUntilPayment = differenceInDays(paymentDateStart, today);

        if (isAdvancePayment) {
            if (daysUntilPayment > 7) {
                return { status: PaymentStatus.PAID, description: 'Pagado' };
            }
            if (daysUntilPayment >= 0) {
                return { status: PaymentStatus.EXPIRING, description: 'Por vencer' };
            }
        }

        if (daysUntilPayment > 7) {
            return { status: PaymentStatus.PAID, description: 'Pagado' };
        }
        if (daysUntilPayment >= 0) {
            return { status: PaymentStatus.EXPIRING, description: 'Por vencer' };
        }
        if (daysUntilPayment >= -7) {
            return { status: PaymentStatus.EXPIRED, description: 'Vencido' };
        }
        return { status: PaymentStatus.SUSPENDED, description: 'Suspendido' };
    }

    async create(createDto: CreateInstallationDto): Promise<Installation> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Verificar que el cliente existe
            const client = await this.clientRepository.findOne({ where: { id: createDto.clientId } });
            if (!client) {
                throw new NotFoundException(`Cliente con ID ${createDto.clientId} no encontrado`);
            }

            // Verificar que el plan existe
            const plan = await this.planRepository.findOne({ where: { id: createDto.planId } });
            if (!plan) {
                throw new NotFoundException(`Plan con ID ${createDto.planId} no encontrado`);
            }

            // Verificar que el sector existe
            const sector = await this.sectorRepository.findOne({ where: { id: createDto.sectorId } });
            if (!sector) {
                throw new NotFoundException(`Sector con ID ${createDto.sectorId} no encontrado`);
            }

            // Crear la instalación
            const installationData: Partial<Installation> = {
                client,
                installationDate: new Date(`${createDto.installationDate}T12:00:00Z`),
                reference: createDto.reference,
                ipAddress: createDto.ipAddress,
                referenceImage: createDto.referenceImage,
                plan,
                sector,
            };

            const installation = queryRunner.manager.create(Installation, installationData);
            const savedInstallation = await queryRunner.manager.save(Installation, installation);

            // Crear configuración de pago si se proporcionan datos
            if (createDto.paymentDate || createDto.advancePayment !== undefined) {
                const { status, description } = this.calculatePaymentStatus(
                    createDto.paymentDate ? new Date(`${createDto.paymentDate}T12:00:00Z`) : null,
                    createDto.advancePayment ?? false
                );

                const paymentConfigData: Partial<ClientPaymentConfig> = {
                    installationId: savedInstallation.id,
                    initialPaymentDate: createDto.paymentDate ? new Date(`${createDto.paymentDate}T12:00:00Z`) : null,
                    advancePayment: createDto.advancePayment ?? false,
                    paymentStatus: status,
                };

                const paymentConfig = queryRunner.manager.create(ClientPaymentConfig, paymentConfigData);
                await queryRunner.manager.save(ClientPaymentConfig, paymentConfig);

                this.logger.log(`Instalación para cliente ${client.dni} - ${description}. Estado: ${status}`);
            }

            // Crear dispositivos si se proporcionan
            if (createDto.routerSerial) {
                const routerDevice: Partial<Device> = {
                    serialNumber: createDto.routerSerial,
                    type: 'router' as any,
                    status: 'ASSIGNED' as any,
                    useType: 'CLIENT' as any,
                    assignedClientId: client.id,
                    assignedInstallationId: savedInstallation.id,
                };
                await queryRunner.manager.save(Device, queryRunner.manager.create(Device, routerDevice));
            }

            if (createDto.decoSerial) {
                const decoDevice: Partial<Device> = {
                    serialNumber: createDto.decoSerial,
                    type: 'deco' as any,
                    status: 'ASSIGNED' as any,
                    useType: 'CLIENT' as any,
                    assignedClientId: client.id,
                    assignedInstallationId: savedInstallation.id,
                };
                await queryRunner.manager.save(Device, queryRunner.manager.create(Device, decoDevice));
            }

            await queryRunner.commitTransaction();
            this.logger.log(`Instalación creada ID ${savedInstallation.id} para cliente ${client.dni}`);
            return savedInstallation;
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

    async findAll(): Promise<Installation[]> {
        return this.installationRepository.find({
            relations: [ 'client', 'plan', 'sector', 'paymentConfig', 'devices' ]
        });
    }

    async findOne(id: number): Promise<Installation> {
        const installation = await this.installationRepository.findOne({
            where: { id },
            relations: [ 'client', 'plan', 'sector', 'paymentConfig', 'devices' ]
        });
        if (!installation) throw new NotFoundException(`Installation #${id} not found`);
        return installation;
    }

    async update(id: number, updateDto: UpdateInstallationDto): Promise<Installation> {
        const installation = await this.findOne(id);
        Object.assign(installation, updateDto);
        return this.installationRepository.save(installation);
    }

    async remove(id: number): Promise<void> {
        const installation = await this.findOne(id);
        await this.installationRepository.remove(installation);
    }
} 