import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { InstallationsService } from './installations.service';
import { CreateInstallationDto } from './dto/create-installation.dto';
import { UpdateInstallationDto } from './dto/update-installation.dto';

@Controller('installations')
export class InstallationsController {
    constructor(private readonly installationsService: InstallationsService) { }

    @Post()
    create(@Body() createInstallationDto: CreateInstallationDto) {
        return this.installationsService.create(createInstallationDto);
    }

    @Get()
    findAll() {
        return this.installationsService.findAll();
    }

    @Get('client/:clientId')
    findByClientId(@Param('clientId', ParseIntPipe) clientId: number) {
        return this.installationsService.findByClientId(clientId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.installationsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateInstallationDto: UpdateInstallationDto) {
        return this.installationsService.update(id, updateInstallationDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.installationsService.remove(id);
    }
} 