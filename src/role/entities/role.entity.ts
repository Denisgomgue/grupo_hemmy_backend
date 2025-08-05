import { RoleHasPermission } from 'src/role-has-permissions/entities/role-has-permission.entity';
import { Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Entity } from 'typeorm';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: false })
    allowAll: boolean;

    @Column({ default: false })
    isPublic: boolean;

    @OneToMany(type => RoleHasPermission, role_has_permissions => role_has_permissions.role, {
        cascade: true,
    })
    role_has_permissions: RoleHasPermission[];

    // @OneToMany(() => Employee, employee => employee.role)
    // employees: Employee[];

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
}
