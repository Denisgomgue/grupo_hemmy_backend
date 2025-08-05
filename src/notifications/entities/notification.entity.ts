import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

export enum NotificationType {
    CLIENT_SUSPENDED = 'CLIENT_SUSPENDED',
    CLIENT_ACTIVATED = 'CLIENT_ACTIVATED',
    PAYMENT_DUE_SOON = 'PAYMENT_DUE_SOON',
    PAYMENT_OVERDUE = 'PAYMENT_OVERDUE',
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
    CLIENT_DEACTIVATED = 'CLIENT_DEACTIVATED',
    SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export enum NotificationStatus {
    UNREAD = 'UNREAD',
    READ = 'READ'
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: NotificationType,
        nullable: false
    })
    type: NotificationType;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.UNREAD
    })
    status: NotificationStatus;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    message: string;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column({ nullable: true })
    clientId: number;

    @Column({ nullable: true })
    paymentId: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    userId: number;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
} 