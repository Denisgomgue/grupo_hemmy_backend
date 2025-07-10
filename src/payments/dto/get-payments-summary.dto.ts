import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';

const allowedPeriods = [ 'allTime', 'thisMonth', 'last7Days', 'today' ];

export class GetPaymentsSummaryDto {
  @IsOptional()
  @IsString()
  @IsIn(allowedPeriods, { message: `El período debe ser uno de: ${allowedPeriods.join(', ')}` })
  period?: string = 'allTime'; // Valor por defecto

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
} 