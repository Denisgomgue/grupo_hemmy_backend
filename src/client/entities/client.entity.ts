import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from 'typeorm';
import { Sector } from 'src/sectors/entities/sector.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Installation } from 'src/installations/entities/installation.entity';
import { Device } from 'src/devices/entities/device.entity';

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    INACTIVE = 'INACTIVE'
}

@Entity('clients')
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ unique: true }) //dni is unique
    dni: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    birthdate: Date;

    @Column({
        type: 'enum',
        enum: AccountStatus,
        default: AccountStatus.ACTIVE
    })
    status: AccountStatus;

    @OneToMany(() => Payment, (payment) => payment.client)
    payments: Payment[];

    @OneToMany(() => Installation, (installation) => installation.client)
    installations: Installation[];

    @OneToMany(() => Device, (device) => device.client)
    devices: Device[];

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
}
