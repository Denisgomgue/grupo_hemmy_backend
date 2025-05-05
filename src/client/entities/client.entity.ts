import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Sector } from 'src/sectors/entities/sector.entity';
import { Plan } from 'src/plans/entities/plan.entity';


export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    INACTIVE = 'INACTIVE'
}

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    dni: string;

    @Column()
    phone: string;

    @Column()
    address: string;

    @Column({ nullable: true })
    installationDate: Date;


    @Column({ nullable: true })
    reference: string;

    @Column({ nullable: true })
    paymentDate: Date;

    @Column({ nullable: true })
    advancePayment: boolean;

    @Column({
        type: 'enum',
        enum: AccountStatus,
        default: AccountStatus.ACTIVE
    })
    status: AccountStatus;

    @Column({ nullable: true})
    description: string;    

    @ManyToOne(() => Plan, { eager: true, nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'planId' })
    plan: Plan;

    @ManyToOne(() => Sector, { eager: true, nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'sectorId' })
    sector: Sector;

    @CreateDateColumn({ type: "timestamp", default:() => "CURRENT_TIMESTAMP(6)"})
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default:() => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"})
    public updated_at: Date;
}
