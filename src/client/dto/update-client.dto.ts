import { AccountStatus } from "../entities/client.entity";
import { IsString, IsOptional, IsBoolean, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateClientDto {
    // Datos del cliente
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    dni?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    birthdate?: string;

    @IsOptional()
    @IsEnum(AccountStatus)
    status?: AccountStatus;

    // Datos de instalación
    @IsOptional()
    @IsDateString()
    installationDate?: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    ipAddress?: string;

    @IsOptional()
    @IsString()
    referenceImage?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    planId?: number;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    sectorId?: number;

    // Datos de pago
    @IsOptional()
    @IsDateString()
    paymentDate?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        // Manejar directamente valores 0 y 1
        if (value === '1' || value === 1 || value === true) {
            return true;
        }
        // Para cualquier otro valor (0, '0', false, undefined, null, '') retornar false
        return false;
    })
    advancePayment?: boolean;

    // Datos de dispositivos
    @IsOptional()
    @IsString()
    routerSerial?: string;

    @IsOptional()
    @IsString()
    decoSerial?: string;
}
