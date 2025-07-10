import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
    @IsString()
    name: string;

    @IsString()
    lastName: string;

    @IsString()
    dni: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsNumber()
    roleId: number;
} 