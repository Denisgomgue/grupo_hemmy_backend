import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Notification)
        private notificationsRepository: Repository<Notification>,
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) { }

    async createNotification(data: {
        type: NotificationType;
        title: string;
        message: string;
        metadata?: Record<string, any>;
        clientId?: number;
        paymentId?: number;
        userId?: number;
    }): Promise<Notification> {
        const notification = this.notificationsRepository.create({
            type: data.type,
            title: data.title,
            message: data.message,
            metadata: data.metadata || {},
            clientId: data.clientId,
            paymentId: data.paymentId,
            userId: data.userId,
            status: NotificationStatus.UNREAD
        });

        const savedNotification = await this.notificationsRepository.save(notification);
        this.logger.log(`📢 Notificación creada: ${data.type} - ${data.title}`);

        return savedNotification;
    }

    async getNotifications(userId?: number, limit: number = 50): Promise<Notification[]> {
        const query = this.notificationsRepository.createQueryBuilder('notification')
            .orderBy('notification.created_at', 'DESC')
            .limit(limit);

        if (userId) {
            query.where('notification.userId = :userId', { userId });
        }

        return await query.getMany();
    }

    async getUnreadCount(userId?: number): Promise<number> {
        const query = this.notificationsRepository.createQueryBuilder('notification')
            .where('notification.status = :status', { status: NotificationStatus.UNREAD });

        if (userId) {
            query.andWhere('notification.userId = :userId', { userId });
        }

        return await query.getCount();
    }

    async markAsRead(notificationId: number): Promise<void> {
        await this.notificationsRepository.update(notificationId, {
            status: NotificationStatus.READ
        });
    }

    async markAllAsRead(userId?: number): Promise<void> {
        const query = this.notificationsRepository.createQueryBuilder('notification')
            .update(Notification)
            .set({ status: NotificationStatus.READ })
            .where('notification.status = :status', { status: NotificationStatus.UNREAD });

        if (userId) {
            query.andWhere('notification.userId = :userId', { userId });
        }

        await query.execute();
    }

    async deleteNotification(notificationId: number): Promise<void> {
        await this.notificationsRepository.delete(notificationId);
    }

    async clearAllNotifications(userId?: number): Promise<void> {
        const query = this.notificationsRepository.createQueryBuilder('notification')
            .delete()
            .from(Notification);

        if (userId) {
            query.where('notification.userId = :userId', { userId });
        }

        await query.execute();
    }

    // Métodos específicos para crear notificaciones del sistema
    async notifyClientSuspended(clientId: number, clientName: string): Promise<void> {
        await this.createNotification({
            type: NotificationType.CLIENT_SUSPENDED,
            title: 'Cliente Suspendido',
            message: `El cliente ${clientName} ha sido suspendido por falta de pago.`,
            metadata: { clientId, clientName },
            clientId
        });
    }

    async notifyClientActivated(clientId: number, clientName: string): Promise<void> {
        await this.createNotification({
            type: NotificationType.CLIENT_ACTIVATED,
            title: 'Cliente Activado',
            message: `El cliente ${clientName} ha sido activado automáticamente.`,
            metadata: { clientId, clientName },
            clientId
        });
    }

    async notifyPaymentDueSoon(clientId: number, clientName: string, dueDate: Date): Promise<void> {
        await this.createNotification({
            type: NotificationType.PAYMENT_DUE_SOON,
            title: 'Pago Próximo a Vencer',
            message: `El pago del cliente ${clientName} vence el ${dueDate.toLocaleDateString('es-ES')}.`,
            metadata: { clientId, clientName, dueDate },
            clientId
        });
    }

    async notifyPaymentOverdue(clientId: number, clientName: string, dueDate: Date): Promise<void> {
        await this.createNotification({
            type: NotificationType.PAYMENT_OVERDUE,
            title: 'Pago Vencido',
            message: `El pago del cliente ${clientName} venció el ${dueDate.toLocaleDateString('es-ES')}.`,
            metadata: { clientId, clientName, dueDate },
            clientId
        });
    }

    async notifyPaymentReceived(clientId: number, clientName: string, amount: number): Promise<void> {
        await this.createNotification({
            type: NotificationType.PAYMENT_RECEIVED,
            title: 'Pago Recibido',
            message: `Se ha recibido un pago de $${amount} del cliente ${clientName}.`,
            metadata: { clientId, clientName, amount },
            clientId
        });
    }

    async notifyClientDeactivated(clientId: number, clientName: string): Promise<void> {
        await this.createNotification({
            type: NotificationType.CLIENT_DEACTIVATED,
            title: 'Cliente Dado de Baja',
            message: `El cliente ${clientName} ha sido dado de baja definitivamente.`,
            metadata: { clientId, clientName },
            clientId
        });
    }
} 