import { IsNumber, IsOptional, Min, IsString, IsBoolean, IsEnum } from 'class-validator';
import { PaymentStatus, PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsOptional()
  @IsString() // O IsDateString si quieres validar formato de fecha
  paymentDate?: string;

  // Asumiendo que transfername es opcional basado en la entidad (nullable: true)
  @IsOptional()
  @IsString()
  transfername?: string;

  @IsString()
  reference: string;

  @IsBoolean()
  reconnection: boolean;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  // state (anteriormente paymentStatus en DTO) se calcula en el servicio, así que no debería estar aquí.
  // Si necesitas recibirlo, debe ser opcional y validado.

  @IsOptional()
  discount?: number; 
  @IsOptional()
  @IsNumber()
  client?: number;
  @IsString() // O IsDateString
  dueDate: string;
} 