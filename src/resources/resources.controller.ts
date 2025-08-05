import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('resources')
@UseGuards(AuthGuard)
export class ResourcesController {
    constructor(private readonly resourcesService: ResourcesService) { }

    @Post()
    create(@Body() createResourceDto: CreateResourceDto) {
        return this.resourcesService.create(createResourceDto);
    }

    @Get()
    findAll(@Query('active') active?: string) {
        if (active === 'true') {
            return this.resourcesService.findActive();
        }
        return this.resourcesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.resourcesService.findOne(+id);
    }

    @Get('route/:routeCode')
    findByRouteCode(@Param('routeCode') routeCode: string) {
        return this.resourcesService.findByRouteCode(routeCode);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) {
        return this.resourcesService.update(+id, updateResourceDto);
    }

    @Patch(':id/toggle-active')
    toggleActive(@Param('id') id: string) {
        return this.resourcesService.toggleActive(+id);
    }

    @Patch('order/update')
    updateOrder(@Body() updates: { id: number; orderIndex: number }[]) {
        return this.resourcesService.updateOrder(updates);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.resourcesService.remove(+id);
    }
} 