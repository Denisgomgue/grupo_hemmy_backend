import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Client } from 'src/client/entities/client.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import { Sector } from 'src/sectors/entities/sector.entity';
import { Device } from 'src/devices/entities/device.entity';
import { ClientPaymentConfig } from 'src/client-payment-config/entities/client-payment-config.entity';

@Entity("installations")
export class Installation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Client, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @Column({ type: 'date' })
    installationDate: Date;

    @Column({ type: 'text', nullable: true })
    reference: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    referenceImage: string;

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