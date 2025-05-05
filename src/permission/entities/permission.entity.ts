import { RoleHasPermission } from 'src/role-has-permissions/entities/role-has-permission.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    routeCode: string;

    @Column('simple-array', { nullable: true })
    actions: string[];

    @Column('simple-array', { nullable: true })
    restrictions: string[];

    @Column({ default: false })
    isSubRoute: boolean;

    @OneToMany(type=>RoleHasPermission, role_has_permissions=>role_has_permissions.permission, {
        cascade: true,
    })
    role_has_permissions: RoleHasPermission[];

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
}