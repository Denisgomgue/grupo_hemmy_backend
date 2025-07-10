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

    async findAll(): Promise<Device[]> {
        return this.deviceRepository.find();
    }

    async findOne(id: number): Promise<Device> {
        const device = await this.deviceRepository.findOne({ where: { id } });
        if (!device) {
            throw new NotFoundException(`Device #${id} not found`);
        }
        return device;
    }

    async update(id: number, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
        const device = await this.findOne(id);
        Object.assign(device, updateDeviceDto);
        return this.deviceRepository.save(device);
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
} 