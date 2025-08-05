import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Installation } from 'src/installations/entities/installation.entity';
import { Employee } from 'src/employees/entities/employee.entity';
import { Client } from 'src/client/entities/client.entity';
// enum('router','deco','ont','switch','laptop','crimpadora','tester','antena','fibra','conector','otro')
export enum DeviceType {
    ROUTER = 'router',
    DECO = 'deco',
    ONT = 'ont',
    SWITCH = 'switch',
    LAPTOP = 'laptop',
    CRIMPADORA = 'crimpadora',
    TESTER = 'tester',
    ANTENA = 'antena',
    FIBRA = 'fibra',
    CONECTOR = 'conector',
    OTRO = 'otro'
}
// enum('STOCK','ASSIGNED','SOLD','MAINTENANCE','LOST','USED')
export enum DeviceStatus {
    STOCK = 'STOCK',
    ASSIGNED = 'ASSIGNED',
    SOLD = 'SOLD',
    MAINTENANCE = 'MAINTENANCE',
    LOST = 'LOST',
    USED = 'USED'
}
// enum('CLIENT','EMPLOYEE','COMPANY','CONSUMABLE')
export enum DeviceUseType {
    CLIENT = 'CLIENT',
    EMPLOYEE = 'EMPLOYEE',
    COMPANY = 'COMPANY',
    CONSUMABLE = 'CONSUMABLE'
}

@Entity("devices")
export class Device {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true }) //serial number is unique
    serialNumber: string;

    @Column({ nullable: true })
    macAddress: string;

    @Column({ type: 'enum', enum: DeviceType })
    type: DeviceType;

    @Column({ nullable: true })
    brand: string;

    @Column({ nullable: true })
    model: string;

    @Column({ type: 'enum', enum: DeviceStatus })
    status: DeviceStatus;

    @Column({ type: 'date', nullable: true })
    assignedDate: Date;

    @Column({ type: 'enum', enum: DeviceUseType })
    useType: DeviceUseType;


    @Column({ nullable: true, type: 'int' })
    assignedInstallationId: number | null;

    @ManyToOne(() => Installation, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assignedInstallationId' })
    installation: Installation;

    @Column({ nullable: true, type: 'int' })
    assignedEmployeeId: number | null;

    @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assignedEmployeeId' })
    employee: Employee;

    @Column({ nullable: true, type: 'int' })
    assignedClientId: number | null;

    @ManyToOne(() => Client, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assignedClientId' })
    client: Client;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
} 