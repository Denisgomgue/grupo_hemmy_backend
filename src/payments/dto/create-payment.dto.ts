import { IsNumber, IsOptional, Min, IsString, IsBoolean, IsEnum, IsDateString, ValidateIf } from 'class-validator';
import { PaymentStatus, PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsDateString() // Cambiamos a IsDateString para validar el formato de fecha
  paymentDate?: string;

  // Asumiendo que transfername es opcional basado en la entidad (nullable: true)
  @IsOptional()
  @IsString()
  transfername?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsBoolean()
  reconnection: boolean;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseAmount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  reconnectionFee?: number;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  // state (anteriormente paymentStatus en DTO) se calcula en el servicio, así que no debería estar aquí.
  // Si necesitas recibirlo, debe ser opcional y validado.

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discount?: number;
  @IsOptional()
  @IsNumber()
  client?: number;
  @IsString() // O IsDateString
  dueDate: string;

  @IsOptional()
  @ValidateIf((o) => o.engagementDate !== undefined && o.engagementDate !== '')
  @IsDateString()
  engagementDate?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
} 