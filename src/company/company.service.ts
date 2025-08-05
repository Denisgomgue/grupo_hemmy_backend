import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
    ) { }

    async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
        // Verificar si ya existe una empresa con el mismo RUC
        const existingCompany = await this.companyRepository.findOne({
            where: { ruc: createCompanyDto.ruc }
        });

        if (existingCompany) {
            throw new ConflictException('Ya existe una empresa con este RUC');
        }

        const company = this.companyRepository.create(createCompanyDto);
        return await this.companyRepository.save(company);
    }

    async findAll(): Promise<Company[]> {
        return await this.companyRepository.find({
            where: { isActive: true },
            order: { created_at: 'DESC' }
        });
    }

    async findOne(id: number): Promise<Company> {
        const company = await this.companyRepository.findOne({
            where: { id, isActive: true }
        });

        if (!company) {
            throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
        }

        return company;
    }

    async findActive(): Promise<Company | null> {
        return await this.companyRepository.findOne({
            where: { isActive: true },
            order: { created_at: 'DESC' }
        });
    }

    async update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
        const company = await this.findOne(id);

        // Si se está actualizando el RUC, verificar que no exista otro
        if (updateCompanyDto.ruc && updateCompanyDto.ruc !== company.ruc) {
            const existingCompany = await this.companyRepository.findOne({
                where: { ruc: updateCompanyDto.ruc }
            });

            if (existingCompany) {
                throw new ConflictException('Ya existe una empresa con este RUC');
            }
        }

        Object.assign(company, updateCompanyDto);
        return await this.companyRepository.save(company);
    }

    async remove(id: number): Promise<void> {
        const company = await this.findOne(id);
        company.isActive = false;
        await this.companyRepository.save(company);
    }

    async uploadLogo(id: number, logoType: string, logoPath: string): Promise<Company> {
        const company = await this.findOne(id);

        switch (logoType) {
            case 'normal':
                company.logoNormal = logoPath;
                break;
            case 'horizontal':
                company.logoHorizontal = logoPath;
                break;
            case 'reduced':
                company.logoReduced = logoPath;
                break;
            case 'negative':
                company.logoNegative = logoPath;
                break;
            default:
                throw new Error('Tipo de logo no válido');
        }

        return await this.companyRepository.save(company);
    }

    async getCompanyInfo(): Promise<any> {
        const company = await this.findActive();

        if (!company) {
            throw new NotFoundException('No hay información de empresa configurada');
        }

        return {
            id: company.id,
            name: company.name,
            businessName: company.businessName,
            ruc: company.ruc,
            address: company.address,
            district: company.district,
            city: company.city,
            province: company.province,
            country: company.country,
            phone: company.phone,
            email: company.email,
            website: company.website,
            description: company.description,
            logos: {
                normal: company.logoNormal,
                horizontal: company.logoHorizontal,
                reduced: company.logoReduced,
                negative: company.logoNegative
            },
            slogan: company.slogan,
            mission: company.mission,
            vision: company.vision,
            socialMedia: company.socialMedia ? JSON.parse(company.socialMedia) : null,
            businessHours: company.businessHours,
            taxCategory: company.taxCategory,
            economicActivity: company.economicActivity
        };
    }
} 