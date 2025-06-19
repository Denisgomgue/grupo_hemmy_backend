import { AccountStatus, PaymentStatus } from "../entities/client.entity";
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClientDto {
    @IsString()
    name: string;

    @IsString()
    lastName: string;

    @IsString()
    dni: string;

    @IsString()
    phone: string;

    @IsString()
    address: string;

    @IsString()
    installationDate: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    referenceImage?: string;

    @IsString()
    paymentDate: string;

    @IsBoolean()
    @Transform(({ value }) => {
        if (value === '1' || value === 1 || value === true || value === 'true') return true;
        if (value === '0' || value === 0 || value === false || value === 'false') return false;
        return false;
    })
    advancePayment: boolean;

    @IsEnum(AccountStatus)
    status: AccountStatus;

    @IsString()
    description: string;

    @IsOptional()
    plan?: number;

    @IsOptional()
    sector?: number;

    @IsOptional()
    @IsString()
    routerSerial?: string;

    @IsOptional()
    @IsString()
    decoSerial?: string;

    @IsOptional()
    @IsString()
    ipAddress?: string;

    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;
}