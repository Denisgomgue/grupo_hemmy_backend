import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ServiceStatus } from '../entities/service.entity';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  status?: ServiceStatus;
}
