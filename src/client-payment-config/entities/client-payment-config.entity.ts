import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Installation } from '../../installations/entities/installation.entity';

export enum PaymentStatus {
    SUSPENDED = 'SUSPENDED',
    EXPIRED = 'EXPIRED',
    EXPIRING = 'EXPIRING',
    PAID = 'PAID'
}

@Entity('client_payment_configs')
export class ClientPaymentConfig {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    initialPaymentDate: Date;

    @Column({ nullable: true })
    installationId: number;

    @Column({ type: 'boolean', default: false })
    advancePayment: boolean;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PAID })
    paymentStatus: PaymentStatus;

    @OneToOne(() => Installation, (installation) => installation.paymentConfig)
    @JoinColumn({ name: 'installationId' })
    Installation: Installation;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
} 