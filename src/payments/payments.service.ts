import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPaymentsSummaryDto } from './dto/get-payments-summary.dto';
import { Client } from '../client/entities/client.entity';
import { PaymentHistory } from 'src/payment-histories/entities/payment-history.entity';
import { Installation } from 'src/installations/entities/installation.entity';
import { ClientPaymentConfig, PaymentStatus as ClientPaymentStatus } from 'src/client-payment-config/entities/client-payment-config.entity';
import { User } from 'src/user/entities/user.entity';
import { UpdatePaymentDto } from './dto/update-payment.dto';

/**
 * Interface para la estructura del código de pago
 */
interface PaymentCodeStructure {
    prefix: string;        // Prefijo estándar del sistema (ej: PG)
    clientId: string;      // Identificador único del cliente
    sequence: string;      // Número de secuencia del pago
}

/**
 * Servicio para la gestión de pagos - Versión actualizada para nueva estructura
 * Maneja todas las operaciones relacionadas con pagos:
 * - CRUD de pagos
 * - Generación y gestión de códigos de pago
 * - Cálculo de estados y montos
 * - Sincronización con estados de cliente
 * - Gestión de configuraciones de pago
 */
@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly RECONNECTION_FEE = 10; // Cargo fijo por reconexión
    private readonly PAYMENT_CODE_PREFIX = 'PG'; // Prefijo estándar para códigos de pago
    private readonly SEQUENCE_LENGTH = 4; // Longitud del número de secuencia

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
        @InjectRepository(Installation)
        private installationRepository: Repository<Installation>,
        @InjectRepository(ClientPaymentConfig)
        private clientPaymentConfigRepository: Repository<ClientPaymentConfig>,
    ) { }

    // ==================== Utilidades Privadas ====================

    /**
     * Convierte un valor a número decimal con 2 decimales
     * @param value - Valor a convertir
     * @returns number
     */
    private toFloat(value: any): number {
        if (value === null || value === undefined || value === '') {
            return 0;
        }
        return parseFloat(parseFloat(value.toString()).toFixed(2));
    }

    /**
     * Determina el estado de un pago basado en sus fechas
     * @param dueDate - Fecha de vencimiento
     * @param paymentDate - Fecha de pago
     * @returns PaymentStatus
     */
    private determinarEstadoPago(dueDate: string, paymentDate: string | null): PaymentStatus {
        if (!paymentDate) return PaymentStatus.PENDING;

        const fechaVencimiento = new Date(dueDate);
        const fechaPago = new Date(paymentDate);
        fechaVencimiento.setHours(0, 0, 0, 0);
        fechaPago.setHours(0, 0, 0, 0);

        return fechaPago > fechaVencimiento ?
            PaymentStatus.LATE_PAYMENT :
            PaymentStatus.PAYMENT_DAILY;
    }

    /**
     * Traduce el estado del pago al español
     * @param estado - Estado del pago
     * @returns string
     */
    private transformarEstadoAEspanol(estado: PaymentStatus): string {
        return this.estadosEnEspanol[ estado ] || estado;
    }

    /**
     * Normaliza una fecha asegurando consistencia en UTC
     * @param date - Fecha a normalizar
     * @param description - Descripción para logging
     * @returns Date
     */
    private normalizeDate(date: string | Date, description: string = ''): Date {
        const inputDate = typeof date === 'string'
            ? new Date(`${date.split('T')[ 0 ]}T05:00:00.000Z`)
            : new Date(date);

        const year = inputDate.getUTCFullYear();
        const month = inputDate.getUTCMonth();
        const day = inputDate.getUTCDate();

        const normalizedDate = new Date(Date.UTC(year, month, day, 5, 0, 0, 0));

        this.logger.debug(`[${description}] 
      Input date: ${inputDate.toISOString()}
      Normalized date: ${normalizedDate.toISOString()}
    `);

        return normalizedDate;
    }

    /**
     * Obtiene la configuración de pago de un cliente
     * @param clientId - ID del cliente
     * @returns Promise<ClientPaymentConfig | null>
     */
    private async getClientPaymentConfig(clientId: number): Promise<ClientPaymentConfig | null> {
        const installation = await this.installationRepository.findOne({
            where: { client: { id: clientId } },
            relations: [ 'paymentConfig' ]
        });

        return installation?.paymentConfig || null;
    }

    // ==================== Gestión de Códigos de Pago ====================

    /**
     * Genera un identificador único para el cliente basado en sus datos inmutables
     * @param client - Cliente
     * @returns string
     */
    private generateClientIdentifier(client: Client): string {
        // Usamos el DNI como base ya que es inmutable y único
        const dniHash = client.dni.slice(-4); // Últimos 4 dígitos del DNI

        // Agregamos iniciales del nombre y apellido
        const nameInitial = client.name.charAt(0).toUpperCase();
        const lastNameInitial = client.lastName.charAt(0).toUpperCase();

        return `${nameInitial}${lastNameInitial}${dniHash}`;
    }

    /**
     * Obtiene el último número de secuencia para un cliente
     * @param clientId - ID del cliente
     * @returns Promise<number>
     */
    private async getLastSequenceNumber(clientId: number): Promise<number> {
        const lastPayment = await this.paymentsRepository.findOne({
            where: { client: { id: clientId } },
            order: { created_at: 'DESC' }
        });

        if (!lastPayment?.code) return 0;

        const sequenceStr = lastPayment.code.split('-')[ 1 ];
        const sequence = parseInt(sequenceStr, 10);
        return isNaN(sequence) ? 0 : sequence;
    }

    /**
     * Genera un nuevo código de pago
     * @param client - Cliente
     * @returns Promise<string>
     */
    private async generatePaymentCode(client: Client): Promise<string> {
        // Estructura base del código
        const codeStructure: PaymentCodeStructure = {
            prefix: this.PAYMENT_CODE_PREFIX,
            clientId: this.generateClientIdentifier(client),
            sequence: ''
        };

        // Obtener y formatear el número de secuencia
        const lastSequence = await this.getLastSequenceNumber(client.id);
        const newSequence = lastSequence + 1;
        codeStructure.sequence = newSequence.toString().padStart(this.SEQUENCE_LENGTH, '0');

        // Generar el código final
        return `${codeStructure.prefix}-${codeStructure.clientId}-${codeStructure.sequence}`;
    }

    // Método para actualizar el cliente cuando se realiza un pago
    private async updateClientAfterPayment(clientId: number, dueDate: string) {
        if (!clientId) return;

        try {
            // Obtener la configuración de pago del cliente
            const paymentConfig = await this.getClientPaymentConfig(clientId);
            if (!paymentConfig) {
                this.logger.warn(`No se encontró configuración de pago para el cliente ${clientId}`);
                return;
            }

            // Actualizar el estado de pago del cliente
            paymentConfig.paymentStatus = ClientPaymentStatus.PAID;
            await this.clientPaymentConfigRepository.save(paymentConfig);

            this.logger.log(`Estado de pago actualizado para el cliente ${clientId}: PAID`);
        } catch (error) {
            this.logger.error(`Error actualizando estado de pago del cliente ${clientId}:`, error);
        }
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

        const installation = await this.installationRepository.findOne({
            where: { client: { id: client.id } },
            relations: [ 'plan' ]
        });
        if (!installation?.plan) {
            throw new NotFoundException('El cliente no tiene plan asignado');
        }

        const paymentCode = await this.generatePaymentCode(client);

        // Convertir todos los montos a float con 2 decimales
        const baseAmount = this.toFloat(installation.plan.price);
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
            payment.status = this.determinarEstadoPago(createPaymentDto.dueDate, createPaymentDto.paymentDate);
            this.logger.debug(`Estado calculado para el pago: ${payment.status}`);
        } else {
            payment.status = PaymentStatus.PENDING;
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
            type: 'PAYMENT' as any,
            description: `Pago ${savedPayment.code}`
        });
        await this.paymentHistoryRepository.save(history);
        this.logger.log(`Historial de pago creado para pago ID ${savedPayment.id}`);

        return {
            ...savedPayment,
            stateInSpanish: this.transformarEstadoAEspanol(savedPayment.status)
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
                created_at: 'DESC'
            }
        });

        return payments.map(payment => ({
            ...payment,
            stateInSpanish: this.transformarEstadoAEspanol(payment.status)
        }));
    }

    async findOne(id: number) {
        const payment = await this.paymentsRepository.findOneBy({ id });
        if (!payment) {
            throw new NotFoundException(`Pago con ID ${id} no encontrado`);
        }
        return {
            ...payment,
            stateInSpanish: this.transformarEstadoAEspanol(payment.status)
        };
    }

    async update(id: number, updatePaymentDto: UpdatePaymentDto, user?: User) {
        this.logger.log(`Actualizando pago ID ${id}`);

        const payment = await this.paymentsRepository.findOne({
            where: { id },
            relations: [ 'client' ]
        });

        if (!payment) {
            throw new NotFoundException(`Pago con ID ${id} no encontrado`);
        }

        // Convertir todos los montos a float con 2 decimales
        // Obtener el plan desde la instalación del cliente
        const installation = await this.installationRepository.findOne({
            where: { client: { id: payment.client.id } },
            relations: [ 'plan' ]
        });
        const baseAmount = installation?.plan?.price ? this.toFloat(installation.plan.price) : 0;
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

        // Actualizar los campos del pago
        Object.assign(payment, {
            ...updatePaymentDto,
            baseAmount: this.toFloat(baseAmount),
            reconnectionFee: this.toFloat(reconnectionFee),
            discount: this.toFloat(discount),
            amount: this.toFloat(totalAmount)
        });

        // Normalizar fechas si se proporcionan
        if (updatePaymentDto.paymentDate) {
            payment.paymentDate = this.normalizeDate(updatePaymentDto.paymentDate, 'Fecha de pago en update');
        }
        if (updatePaymentDto.dueDate) {
            payment.dueDate = this.normalizeDate(updatePaymentDto.dueDate, 'Fecha de vencimiento en update');
        }

        // Recalcular el estado si se actualizaron las fechas
        if (updatePaymentDto.dueDate || updatePaymentDto.paymentDate) {
            payment.status = this.determinarEstadoPago(
                updatePaymentDto.dueDate || payment.dueDate?.toISOString().split('T')[ 0 ] || '',
                updatePaymentDto.paymentDate || payment.paymentDate?.toISOString().split('T')[ 0 ] || null
            );
        }

        const updatedPayment = await this.paymentsRepository.save(payment);
        this.logger.log(`Pago ID ${id} actualizado correctamente`);

        // Actualizar historial
        const history = this.paymentHistoryRepository.create({
            payment: updatedPayment,
            client: updatedPayment.client,
            user: user || null,
            amount: updatedPayment.amount,
            discount: updatedPayment.discount,
            paymentDate: updatedPayment.paymentDate,
            dueDate: updatedPayment.dueDate,
            reference: updatedPayment.reference,
            type: 'ADJUSTMENT' as any,
            description: `Actualización de pago ${updatedPayment.code}`
        });
        await this.paymentHistoryRepository.save(history);

        return {
            ...updatedPayment,
            stateInSpanish: this.transformarEstadoAEspanol(updatedPayment.status)
        };
    }

    async remove(id: number, user?: User) {
        this.logger.log(`Eliminando pago ID ${id}`);

        const payment = await this.paymentsRepository.findOne({
            where: { id },
            relations: [ 'client' ]
        });

        if (!payment) {
            throw new NotFoundException(`Pago con ID ${id} no encontrado`);
        }

        // Marcar como anulado en lugar de eliminar
        payment.isVoided = true;
        payment.voidedAt = new Date();
        payment.voidedReason = 'Eliminado por usuario';

        const voidedPayment = await this.paymentsRepository.save(payment);

        // Crear registro en historial
        const history = this.paymentHistoryRepository.create({
            payment: voidedPayment,
            client: voidedPayment.client,
            user: user || null,
            amount: voidedPayment.amount,
            discount: voidedPayment.discount,
            paymentDate: voidedPayment.paymentDate,
            dueDate: voidedPayment.dueDate,
            reference: voidedPayment.reference,
            type: 'VOID' as any,
            description: `Pago anulado: ${voidedPayment.code}`
        });
        await this.paymentHistoryRepository.save(history);

        this.logger.log(`Pago ID ${id} anulado correctamente`);

        return {
            message: 'Pago anulado correctamente',
            payment: {
                ...voidedPayment,
                stateInSpanish: this.transformarEstadoAEspanol(voidedPayment.status)
            }
        };
    }

    async getSummary(getPaymentsSummaryDto: GetPaymentsSummaryDto) {
        const queryBuilder = this.paymentsRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.client', 'client');

        // Aplicar filtros de fecha si se proporcionan
        if (getPaymentsSummaryDto.startDate && getPaymentsSummaryDto.endDate) {
            queryBuilder.andWhere('payment.created_at BETWEEN :startDate AND :endDate', {
                startDate: getPaymentsSummaryDto.startDate,
                endDate: getPaymentsSummaryDto.endDate
            });
        }

        const payments = await queryBuilder.getMany();

        // Calcular estadísticas
        const totalPayments = payments.length;
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalDiscount = payments.reduce((sum, payment) => sum + payment.discount, 0);
        const totalReconnectionFees = payments.reduce((sum, payment) => sum + payment.reconnectionFee, 0);

        const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING).length;
        const dailyPayments = payments.filter(p => p.status === PaymentStatus.PAYMENT_DAILY).length;
        const latePayments = payments.filter(p => p.status === PaymentStatus.LATE_PAYMENT).length;
        const voidedPayments = payments.filter(p => p.isVoided).length;

        return {
            totalPayments,
            totalAmount,
            totalDiscount,
            totalReconnectionFees,
            pendingPayments,
            dailyPayments,
            latePayments,
            voidedPayments,
            averageAmount: totalPayments > 0 ? totalAmount / totalPayments : 0
        };
    }

    async getLastPaymentDate(clientId: number) {
        const lastPayment = await this.paymentsRepository.findOne({
            where: { client: { id: clientId }, isVoided: false },
            order: { created_at: 'DESC' }
        });

        if (!lastPayment) {
            return null;
        }

        return {
            paymentDate: lastPayment.paymentDate,
            dueDate: lastPayment.dueDate,
            amount: lastPayment.amount,
            code: lastPayment.code
        };
    }

    async getPaymentBreakdown(id: number) {
        const payment = await this.paymentsRepository.findOne({
            where: { id },
            relations: [ 'client' ]
        });

        if (!payment) {
            throw new NotFoundException(`Pago con ID ${id} no encontrado`);
        }

        // Obtener el plan desde la instalación del cliente
        const installation = await this.installationRepository.findOne({
            where: { client: { id: payment.client.id } },
            relations: [ 'plan' ]
        });

        return {
            id: payment.id,
            code: payment.code,
            client: {
                id: payment.client.id,
                name: payment.client.name,
                lastName: payment.client.lastName,
                dni: payment.client.dni
            },
            plan: installation?.plan || null,
            baseAmount: payment.baseAmount,
            reconnectionFee: payment.reconnectionFee,
            discount: payment.discount,
            totalAmount: payment.amount,
            paymentDate: payment.paymentDate,
            dueDate: payment.dueDate,
            status: payment.status,
            stateInSpanish: this.transformarEstadoAEspanol(payment.status),
            isVoided: payment.isVoided,
            voidedAt: payment.voidedAt,
            voidedReason: payment.voidedReason
        };
    }

    async recalculateAllPaymentStates() {
        this.logger.log('Iniciando recálculo de estados de todos los pagos');

        const payments = await this.paymentsRepository.find({
            relations: [ 'client' ]
        });

        let updatedCount = 0;
        let errorCount = 0;

        for (const payment of payments) {
            try {
                if (payment.dueDate && payment.paymentDate) {
                    const newState = this.determinarEstadoPago(
                        payment.dueDate.toISOString().split('T')[ 0 ],
                        payment.paymentDate.toISOString().split('T')[ 0 ]
                    );

                    if (payment.status !== newState) {
                        payment.status = newState;
                        await this.paymentsRepository.save(payment);
                        updatedCount++;
                        this.logger.debug(`Pago ID ${payment.id} actualizado: ${payment.status} → ${newState}`);
                    }
                }
            } catch (error) {
                errorCount++;
                this.logger.error(`Error actualizando pago ID ${payment.id}: ${error.message}`);
            }
        }

        this.logger.log(`Recálculo completado: ${updatedCount} pagos actualizados, ${errorCount} errores`);
        return { updatedCount, errorCount };
    }

    async regeneratePaymentCodes() {
        this.logger.log('Iniciando regeneración de códigos de pago');

        const payments = await this.paymentsRepository.find({
            relations: [ 'client' ]
        });

        let updatedCount = 0;
        let errorCount = 0;

        for (const payment of payments) {
            try {
                const newCode = await this.generatePaymentCode(payment.client);
                if (payment.code !== newCode) {
                    payment.code = newCode;
                    await this.paymentsRepository.save(payment);
                    updatedCount++;
                    this.logger.debug(`Pago ID ${payment.id} actualizado: ${payment.code} → ${newCode}`);
                }
            } catch (error) {
                errorCount++;
                this.logger.error(`Error regenerando código para pago ID ${payment.id}: ${error.message}`);
            }
        }

        this.logger.log(`Regeneración completada: ${updatedCount} códigos actualizados, ${errorCount} errores`);
        return { updatedCount, errorCount };
    }
} 