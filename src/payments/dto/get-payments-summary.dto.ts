import { IsOptional, IsString, IsIn } from 'class-validator';

const allowedPeriods = ['allTime', 'thisMonth', 'last7Days', 'today'];

export class GetPaymentsSummaryDto {
  @IsOptional()
  @IsString()
  @IsIn(allowedPeriods, { message: `El período debe ser uno de: ${allowedPeriods.join(', ')}` })
  period?: string = 'allTime'; // Valor por defecto
} 