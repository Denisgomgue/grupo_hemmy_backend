import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceStatus } from './entities/device.entity';

@Controller('devices')
export class DevicesController {
    constructor(private readonly devicesService: DevicesService) { }

    @Post()
    create(@Body() createDeviceDto: CreateDeviceDto) {
        return this.devicesService.create(createDeviceDto);
    }

    @Get()
    findAll() {
        return this.devicesService.findAll();
    }

    @Get('summary')
    getDeviceSummary() {
        return this.devicesService.getDeviceSummary();
    }

    @Get('filter')
    filterDevices(@Query() filters: {
        status?: DeviceStatus;
        type?: string;
        useType?: string;
        assignedClientId?: number;
        assignedEmployeeId?: number;
    }) {
        return this.devicesService.filterDevices(filters);
    }

    @Get('client/:clientId')
    getDevicesByClient(@Param('clientId') clientId: string) {
        return this.devicesService.getDevicesByClient(+clientId);
    }

    @Patch(':id/status')
    updateDeviceStatus(@Param('id') id: string, @Body() body: { status: DeviceStatus }) {
        return this.devicesService.updateDeviceStatus(+id, body.status);
    }

    @Patch(':id/unassign')
    unassignDevice(@Param('id') id: string) {
        // Log removido para limpieza
        return this.devicesService.unassignDevice(+id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.devicesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
        return this.devicesService.update(+id, updateDeviceDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.devicesService.remove(+id);
    }
} 