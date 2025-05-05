
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ nullable: false })
  documentType: string;

  @Column({ nullable: false })
  documentNumber: string;

  @Column({ unique: true, nullable: false })
  username: string;
  
  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: true })
  password: string

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Role, { eager: true, nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;
  
  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  public created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  public updated_at: Date;

}
