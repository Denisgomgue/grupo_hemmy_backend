import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Post()
    create(@Body() createDto: CreateEmployeeDto) {
        return this.employeesService.create(createDto);
    }

    @Get()
    findAll() {
        return this.employeesService.findAll();
    }

    @Get('role/:roleId')
    findByRole(@Param('roleId') roleId: string) {
        return this.employeesService.findByRole(+roleId);
    }

    @Get('dni/:dni')
    findByDni(@Param('dni') dni: string) {
        return this.employeesService.findByDni(dni);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.employeesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
        return this.employeesService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.employeesService.remove(+id);
    }
} 