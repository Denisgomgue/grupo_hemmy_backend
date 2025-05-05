import { Permission } from "src/permission/entities/permission.entity";
import { Role } from "src/role/entities/role.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('role-has-permissions')
export class RoleHasPermission {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type=>Permission, permission=>permission.role_has_permissions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
    })
    permission: Permission;

    @ManyToOne(type=>Role, role=>role.role_has_permissions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
    })
    role: Role;

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

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    // @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    // public updatedAt: Date;
}
