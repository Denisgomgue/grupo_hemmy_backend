import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('companies')
export class Company {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    businessName: string;

    @Column({ nullable: false, unique: true })
    ruc: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    district: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    province: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    website: string;

    @Column({ nullable: true })
    description: string;

    // Logos - 4 tipos diferentes
    @Column({ nullable: true })
    logoNormal: string; // Logo normal/estándar

    @Column({ nullable: true })
    logoHorizontal: string; // Logo horizontal para headers

    @Column({ nullable: true })
    logoReduced: string; // Logo reducido/mini

    @Column({ nullable: true })
    logoNegative: string; // Logo en negativo (blanco sobre fondo oscuro)

    // Información adicional
    @Column({ nullable: true })
    slogan: string;

    @Column({ nullable: true })
    mission: string;

    @Column({ nullable: true })
    vision: string;

    @Column({ nullable: true })
    socialMedia: string; // JSON string con redes sociales

    @Column({ nullable: true })
    businessHours: string;

    @Column({ nullable: true })
    taxCategory: string;

    @Column({ nullable: true })
    economicActivity: string;

    @Column({
        type: 'boolean',
        default: true
    })
    isActive: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
} 