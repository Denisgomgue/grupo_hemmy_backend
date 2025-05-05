import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePlanDto {
  name: string;
  description?: string;
  price: number;
  speed?: string;
  service: number;
}
