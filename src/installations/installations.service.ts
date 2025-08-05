import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInstallationDto } from './dto/create-installation.dto';
import { UpdateInstallationDto } from './dto/update-installation.dto';
import { Installation, InstallationStatus } from './entities/installation.entity';

@Injectable()
export class InstallationsService {
    constructor(
        @InjectRepository(Installation)
        private readonly installationRepository: Repository<Installation>,
    ) { }

    create(createInstallationDto: CreateInstallationDto) {
        const installation = this.installationRepository.create(createInstallationDto);
        return this.installationRepository.save(installation);
    }

    findAll() {
        return this.installationRepository.find({
            relations: [ 'client', 'plan', 'sector', 'paymentConfig', 'devices' ]
        });
    }

    findOne(id: number) {
        return this.installationRepository.findOne({
            where: { id },
            relations: [ 'client', 'plan', 'sector', 'paymentConfig', 'devices' ]
        });
    }

    findByClientId(clientId: number) {
        return this.installationRepository.find({
            where: { client: { id: clientId } },
            relations: [ 'client', 'plan', 'plan.service', 'sector', 'paymentConfig', 'devices' ]
        });
    }

    async update(id: number, updateInstallationDto: UpdateInstallationDto) {
        const installation = await this.findOne(id);
        if (!installation) {
            throw new NotFoundException(`Instalación con ID ${id} no encontrada`);
        }

        // Actualizar solo los campos que existen en la entidad
        const { planId, sectorId, clientId, ...updateData } = updateInstallationDto;

        const updatePayload: any = { ...updateData };

        // Si se proporciona planId, actualizar la relación
        if (planId) {
            updatePayload.plan = { id: planId };
        }

        // Si se proporciona sectorId, actualizar la relación
        if (sectorId) {
            updatePayload.sector = { id: sectorId };
        }

        // Si se proporciona clientId, actualizar la relación
        if (clientId) {
            updatePayload.client = { id: clientId };
        }

        // Actualizar la instalación con las relaciones
        await this.installationRepository.save({
            id,
            ...updatePayload
        });

        return await this.findOne(id);
    }

    remove(id: number) {
        return this.installationRepository.delete(id);
    }
} 