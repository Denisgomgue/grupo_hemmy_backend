import { IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClientPaymentConfigDto {
    @IsOptional()
    @IsNumber()
    installationId?: number;

    @IsOptional()
    @IsDateString()
    initialPaymentDate?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === '1' || value === 1 || value === true || value === 'true') return true;
        if (value === '0' || value === 0 || value === false || value === 'false') return false;
        return false;
    })
    advancePayment?: boolean;
} 