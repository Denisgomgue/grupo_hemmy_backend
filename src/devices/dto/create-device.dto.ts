import { DeviceType, DeviceStatus, DeviceUseType } from '../entities/device.entity';
import { IsEnum, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDeviceDto {
  @IsString()
  serialNumber: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsEnum(DeviceType)
  type: DeviceType;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsEnum(DeviceStatus)
  status: DeviceStatus;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value === '' ? null : value)
  assignedDate?: string | null;

  @IsEnum(DeviceUseType)
  useType: DeviceUseType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === '' ? null : value)
  assignedInstallationId?: number | null;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === '' ? null : value)
  assignedEmployeeId?: number | null;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (value === '' || value === 0) return null;
    return value;
  })
  assignedClientId?: number | null;
} 