import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Payment } from 'src/payments/entities/payment.entity';
import { Client } from 'src/client/entities/client.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
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

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    discount: number;

    @Column({ nullable: true })
    paymentDate: Date;

    @Column({ nullable: true })
    dueDate: Date;

    @Column({ nullable: true })
    reference: string;

    @Column({ nullable: true })
    paymentType: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_At: Date;
} 