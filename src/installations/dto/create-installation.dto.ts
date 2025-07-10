import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInstallationDto {
    @IsNumber()
    clientId: number;

    @IsDateString()
    installationDate: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    ipAddress?: string;

    @IsOptional()
    @IsString()
    referenceImage?: string;

    @IsNumber()
    planId: number;

    @IsNumber()
    sectorId: number;

    @IsOptional()
    @IsDateString()
    paymentDate?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === '1' || value === 1 || value === true || value === 'true') return true;
        if (value === '0' || value === 0 || value === false || value === 'false') return false;
        return false;
    })
    advancePayment?: boolean;

    @IsOptional()
    @IsString()
    routerSerial?: string;

    @IsOptional()
    @IsString()
    decoSerial?: string;
} 