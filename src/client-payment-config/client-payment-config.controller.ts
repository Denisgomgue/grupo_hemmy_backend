import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ClientPaymentConfigService } from './client-payment-config.service';
import { CreateClientPaymentConfigDto } from './dto/create-client-payment-config.dto';
import { UpdateClientPaymentConfigDto } from './dto/update-client-payment-config.dto';

@Controller('client-payment-config')
export class ClientPaymentConfigController {
    constructor(private readonly clientPaymentConfigService: ClientPaymentConfigService) { }

    @Post()
    create(@Body() createClientPaymentConfigDto: CreateClientPaymentConfigDto) {
        return this.clientPaymentConfigService.create(createClientPaymentConfigDto);
    }

    @Get()
    findAll() {
        return this.clientPaymentConfigService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.clientPaymentConfigService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateClientPaymentConfigDto: UpdateClientPaymentConfigDto) {
        return this.clientPaymentConfigService.update(id, updateClientPaymentConfigDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.clientPaymentConfigService.remove(id);
    }
} 