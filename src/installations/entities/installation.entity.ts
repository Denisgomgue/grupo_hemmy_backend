import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Client } from 'src/client/entities/client.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import { Sector } from 'src/sectors/entities/sector.entity';
import { Device } from 'src/devices/entities/device.entity';
import { ClientPaymentConfig } from 'src/client-payment-config/entities/client-payment-config.entity';

export enum InstallationStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

@Entity("installations")
export class Installation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Client, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @Column({ nullable: true })
    installationDate: Date;

    @Column({ type: 'text', nullable: true })
    reference: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    referenceImage: string;

    @Column({
        type: 'enum',
        enum: InstallationStatus,
        default: InstallationStatus.ACTIVE
    })
    status: InstallationStatus;

    @ManyToOne(() => Plan, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'planId' })
    plan: Plan;

    @ManyToOne(() => Sector, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sectorId' })
    sector: Sector;

    @OneToOne(() => ClientPaymentConfig, (config) => config.Installation)
    paymentConfig: ClientPaymentConfig;

    @OneToMany(() => Device, (device) => device.installation)
    devices: Device[];

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
} 