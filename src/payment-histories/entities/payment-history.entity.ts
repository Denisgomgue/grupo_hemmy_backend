

import { Client } from 'src/client/entities/client.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum PaymentHistoryType {
    PAYMENT = 'PAYMENT',
    VOID = 'VOID',
    ADJUSTMENT = 'ADJUSTMENT',
}

@Entity("payment_histories")
export class PaymentHistory {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => Payment, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'paymentId' })
    payment: Payment;

    @ManyToOne(() => Client, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    reference: string;

    @Column({ type: 'enum', enum: PaymentHistoryType, nullable: true })
    type: PaymentHistoryType;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    discount: number;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'date', nullable: true })
    dueDate: Date;

    @Column({ length: 255, nullable: true })
    code: string;

    @Column({ type: 'datetime', nullable: true })
    paymentDate: Date;

    @Column({ type: 'date', nullable: true })
    engagementDate: Date;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
} 