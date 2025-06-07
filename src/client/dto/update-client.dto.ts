import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

const convertToBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
    if (typeof value === 'number') return value === 1;
    return false;
};

export class UpdateClientDto extends PartialType(CreateClientDto) {
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => convertToBoolean(value))
    advancePayment?: boolean;
}
