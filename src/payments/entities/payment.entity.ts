import { Client } from 'src/client/entities/client.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentType {
    TRANSFER = 'TRANSFER',
    CASH = 'CASH',
    YAPE = 'YAPE',
    PLIN = 'PLIN',
    OTHER = 'OTHER',
}


export enum PaymentStatus {
    PENDING = 'PENDING',
    PAYMENT_DAILY = 'PAYMENT_DAILY',
    LATE_PAYMENT = 'LATE_PAYMENT'
}

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    paymentDate?: Date;


    @Column({ nullable: true })
    reference: string;

    @Column()
    reconnection: boolean;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: PaymentStatus, nullable: true })
    state: PaymentStatus;

    @Column({ type: 'enum', enum: PaymentType, nullable: true })
    paymentType: PaymentType;

    @Column({ nullable: true })
    transfername?: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    discount?: number;

    @Column({ nullable: true })
    dueDate?: Date;

    @ManyToOne(() => Client, { eager: true, nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_At: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_At: Date;
} 