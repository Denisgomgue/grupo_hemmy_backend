import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';

@Entity('resources')
export class Resource {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    routeCode: string;

    @Column()
    displayName: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true, default: 0 })
    orderIndex: number;

    @OneToMany(type => Permission, permission => permission.resource, {
        cascade: true,
    })
    permissions: Permission[];

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
} 