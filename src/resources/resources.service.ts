import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
    constructor(
        @InjectRepository(Resource)
        private resourceRepository: Repository<Resource>,
    ) { }

    async create(createResourceDto: CreateResourceDto): Promise<Resource> {
        // Verificar si ya existe un recurso con el mismo routeCode
        const existingResource = await this.resourceRepository.findOne({
            where: { routeCode: createResourceDto.routeCode }
        });

        if (existingResource) {
            throw new ConflictException(`Ya existe un recurso con el routeCode: ${createResourceDto.routeCode}`);
        }

        const resource = this.resourceRepository.create(createResourceDto);
        return await this.resourceRepository.save(resource);
    }

    async findAll(): Promise<Resource[]> {
        return await this.resourceRepository.find({
            order: { 
                orderIndex: 'ASC', 
                displayName: 'ASC' 
            }
        });
    }

    async findActive(): Promise<Resource[]> {
        return await this.resourceRepository.find({
            where: { isActive: true },
            order: { 
                orderIndex: 'ASC', 
                displayName: 'ASC' 
            }
        });
    }

    async findOne(id: number): Promise<Resource> {
        const resource = await this.resourceRepository.findOne({
            where: { id },
            relations: [ 'permissions' ]
        });

        if (!resource) {
            throw new NotFoundException(`Recurso con ID ${id} no encontrado`);
        }

        return resource;
    }

    async findByRouteCode(routeCode: string): Promise<Resource> {
        const resource = await this.resourceRepository.findOne({
            where: { routeCode },
            relations: [ 'permissions' ]
        });

        if (!resource) {
            throw new NotFoundException(`Recurso con routeCode ${routeCode} no encontrado`);
        }

        return resource;
    }

    async update(id: number, updateResourceDto: UpdateResourceDto): Promise<Resource> {
        const resource = await this.findOne(id);

        // Si se está actualizando el routeCode, verificar que no exista otro con el mismo
        if (updateResourceDto.routeCode && updateResourceDto.routeCode !== resource.routeCode) {
            const existingResource = await this.resourceRepository.findOne({
                where: { routeCode: updateResourceDto.routeCode }
            });

            if (existingResource) {
                throw new ConflictException(`Ya existe un recurso con el routeCode: ${updateResourceDto.routeCode}`);
            }
        }

        Object.assign(resource, updateResourceDto);
        return await this.resourceRepository.save(resource);
    }

    async remove(id: number): Promise<void> {
        const resource = await this.findOne(id);

        // Verificar si tiene permisos asociados
        if (resource.permissions && resource.permissions.length > 0) {
            throw new ConflictException('No se puede eliminar un recurso que tiene permisos asociados');
        }

        await this.resourceRepository.remove(resource);
    }

    async toggleActive(id: number): Promise<Resource> {
        const resource = await this.findOne(id);
        resource.isActive = !resource.isActive;
        return await this.resourceRepository.save(resource);
    }

    async updateOrder(updates: { id: number; orderIndex: number }[]): Promise<Resource[]> {
        const resources: Resource[] = [];

        for (const update of updates) {
            const resource = await this.findOne(update.id);
            resource.orderIndex = update.orderIndex;
            resources.push(await this.resourceRepository.save(resource));
        }

        return resources;
    }
} 