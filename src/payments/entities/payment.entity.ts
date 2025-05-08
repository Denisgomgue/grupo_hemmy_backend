import { Client } from 'src/client/entities/client.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentType {
    CASH = 'EFECTIVO',
    TRANSFER = 'TRANSFERENCIA',
    YAPE = 'YAPE',
    PLIN = 'PLIN',
    OTHER = 'OTRO OPCION',
}

export enum PaymentStatus {
    PENDING = 'PENDIENTE',
    PAYMENT_DAILY = 'PAGO AL DIA',
    LATE_PAYMENT = 'PAGO ATRASADO'
}

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    paymentDate?: Date;

    @Column({ nullable: true })
    transfername: string;

    @Column({ nullable: true })
    reference: string;

    @Column()
    reconnection: boolean;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
    })
    state: PaymentStatus;

    @Column({
        type: 'enum',
        enum: PaymentType,
    })
    paymentType?: PaymentType;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    discount: number;

    @Column({ nullable: true })
    dueDate?: Date;

    @ManyToOne(() => Client, { eager: true, nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
} 