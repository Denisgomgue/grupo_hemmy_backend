import { AccountStatus } from "../entities/client.entity";
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
    description: string;

    @IsEnum(AccountStatus)
    status: AccountStatus;
}