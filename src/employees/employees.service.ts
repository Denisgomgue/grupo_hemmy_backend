import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
    ) { }

    // create employee
    async create(createDto: CreateEmployeeDto): Promise<Employee> {
        // Verificar que el DNI no exista
        const existingEmployee = await this.employeeRepository.findOne({
            where: { dni: createDto.dni }
        });

        if (existingEmployee) {
            throw new ConflictException(`Employee with DNI ${createDto.dni} already exists`);
        }

        const employee = this.employeeRepository.create(createDto);
        return this.employeeRepository.save(employee);
    }

    async findAll(): Promise<Employee[]> {
        return this.employeeRepository.find({
            relations: [ 'role' ]
        });
    }

    async findOne(id: number): Promise<Employee> {
        const employee = await this.employeeRepository.findOne({
            where: { id },
            relations: [ 'role' ]
        });
        if (!employee) throw new NotFoundException(`Employee #${id} not found`);
        return employee;
    }

    async findByRole(roleId: number): Promise<Employee[]> {
        return this.employeeRepository.find({
            where: { role: { id: roleId } },
            relations: [ 'role' ]
        });
    }

    async findByDni(dni: string): Promise<Employee> {
        const employee = await this.employeeRepository.findOne({
            where: { dni },
            relations: [ 'role' ]
        });
        if (!employee) throw new NotFoundException(`Employee with DNI ${dni} not found`);
        return employee;
    }

    async update(id: number, updateDto: UpdateEmployeeDto): Promise<Employee> {
        const employee = await this.findOne(id);

        // Si se está actualizando el DNI, verificar que no exista otro empleado con ese DNI
        if (updateDto.dni && updateDto.dni !== employee.dni) {
            const existingEmployee = await this.employeeRepository.findOne({
                where: { dni: updateDto.dni }
            });

            if (existingEmployee) {
                throw new ConflictException(`Employee with DNI ${updateDto.dni} already exists`);
            }
        }

        Object.assign(employee, updateDto);
        return this.employeeRepository.save(employee);
    }

    async remove(id: number): Promise<void> {
        const employee = await this.findOne(id);
        await this.employeeRepository.remove(employee);
    }
} 