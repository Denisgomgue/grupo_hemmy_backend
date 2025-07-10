import { DeviceType, DeviceStatus } from '../entities/device.entity';
import { IsEnum, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  serial_number: string;

  @IsOptional()
  @IsString()
  mac_address?: string;

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
  assigned_date?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  installationId?: number;

  @IsOptional()
  @IsNumber()
  employeeId?: number;
} 