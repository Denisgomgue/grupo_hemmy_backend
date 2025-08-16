import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device, DeviceStatus } from './entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
    constructor(
        @InjectRepository(Device)
        private readonly deviceRepository: Repository<Device>,
    ) { }

    async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
        const device = this.deviceRepository.create(createDeviceDto);
        return this.deviceRepository.save(device);
    }

    async findAll(orderBy: 'created' | 'updated' = 'created', orderDirection: 'ASC' | 'DESC' = 'DESC'): Promise<Device[]> {
        const queryBuilder = this.deviceRepository.createQueryBuilder('device')
            .leftJoinAndSelect('device.installation', 'installation')
            .leftJoinAndSelect('device.employee', 'employee')
            .leftJoinAndSelect('device.client', 'client');

        if (orderBy === 'created') {
            queryBuilder.orderBy('device.created_at', orderDirection);
        } else if (orderBy === 'updated') {
            queryBuilder.orderBy('device.updated_at', orderDirection);
        }

        return queryBuilder.getMany();
    }

    async findOne(id: number): Promise<Device> {
        const device = await this.deviceRepository.findOne({
            where: { id },
            relations: [ 'installation', 'employee', 'client' ]
        });
        if (!device) {
            throw new NotFoundException(`Device #${id} not found`);
        }
        return device;
    }

    async update(id: number, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
        const device = await this.findOne(id);

        // Prevenir cambios en el número de serie
        if (updateDeviceDto.serialNumber && updateDeviceDto.serialNumber !== device.serialNumber) {
            throw new Error('No se puede modificar el número de serie de un dispositivo existente');
        }

        // Manejar la transformación manualmente
        if (updateDeviceDto.assignedClientId === 0) {
            updateDeviceDto.assignedClientId = null;
        }
        if (updateDeviceDto.assignedInstallationId === 0) {
            updateDeviceDto.assignedInstallationId = null;
        }
        if (updateDeviceDto.assignedEmployeeId === 0) {
            updateDeviceDto.assignedEmployeeId = null;
        }
        if (updateDeviceDto.assignedDate === '') {
            updateDeviceDto.assignedDate = null;
        }

        // Aplicar todos los cambios al dispositivo
        Object.assign(device, updateDeviceDto);

        // Usar save() en lugar de queryBuilder para asegurar que todos los campos se actualicen
        try {
            const savedDevice = await this.deviceRepository.save(device);
            return savedDevice;
        } catch (error) {
            throw error;
        }
    }

    async remove(id: number): Promise<void> {
        const device = await this.findOne(id);
        await this.deviceRepository.remove(device);
    }

    async getDeviceSummary() {
        const total = await this.deviceRepository.count();
        // enum('STOCK','ASSIGNED','SOLD','MAINTENANCE','LOST','USED')
        const asignado = await this.deviceRepository.count({ where: { status: DeviceStatus.ASSIGNED } });
        const stock = await this.deviceRepository.count({ where: { status: DeviceStatus.STOCK } });
        const mantenimiento = await this.deviceRepository.count({ where: { status: DeviceStatus.MAINTENANCE } });
        const usado = await this.deviceRepository.count({ where: { status: DeviceStatus.USED } });
        const perdido = await this.deviceRepository.count({ where: { status: DeviceStatus.LOST } });
        const vendido = await this.deviceRepository.count({ where: { status: DeviceStatus.SOLD } });

        return {
            total,
            asignado,
            stock,
            mantenimiento,
            usado,
            perdido,
            vendido,
            // Para compatibilidad con el frontend
            active: asignado,
            offline: perdido,
            maintenance: mantenimiento,
            error: perdido,
            inactive: stock,
            sold: vendido,
            used: usado
        };
    }

    async filterDevices(filters: {
        status?: DeviceStatus;
        type?: string;
        useType?: string;
        assignedClientId?: number;
        assignedEmployeeId?: number;
    }): Promise<Device[]> {
        const queryBuilder = this.deviceRepository.createQueryBuilder('device')
            .leftJoinAndSelect('device.installation', 'installation')
            .leftJoinAndSelect('device.employee', 'employee')
            .leftJoinAndSelect('device.client', 'client');

        if (filters.status) {
            queryBuilder.andWhere('device.status = :status', { status: filters.status });
        }

        if (filters.type) {
            queryBuilder.andWhere('device.type = :type', { type: filters.type });
        }

        if (filters.useType) {
            queryBuilder.andWhere('device.useType = :useType', { useType: filters.useType });
        }

        if (filters.assignedClientId) {
            queryBuilder.andWhere('device.assignedClientId = :assignedClientId', { assignedClientId: filters.assignedClientId });
        }

        if (filters.assignedEmployeeId) {
            queryBuilder.andWhere('device.assignedEmployeeId = :assignedEmployeeId', { assignedEmployeeId: filters.assignedEmployeeId });
        }

        return queryBuilder.getMany();
    }

    async getDevicesByClient(clientId: number): Promise<Device[]> {
        return this.deviceRepository.find({
            where: { assignedClientId: clientId },
            relations: [ 'installation', 'employee', 'client' ]
        });
    }

    async updateDeviceStatus(id: number, status: DeviceStatus): Promise<Device> {
        const device = await this.findOne(id);
        device.status = status;
        return this.deviceRepository.save(device);
    }

    async unassignDevice(id: number): Promise<Device> {
        const device = await this.findOne(id);
        device.status = DeviceStatus.MAINTENANCE;
        device.assignedClientId = null;
        device.assignedDate = null;
        const savedDevice = await this.deviceRepository.save(device);
        return savedDevice;
    }
} 