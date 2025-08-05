import { PartialType } from '@nestjs/mapped-types';
import { CreateClientPaymentConfigDto } from './create-client-payment-config.dto';

export class UpdateClientPaymentConfigDto extends PartialType(CreateClientPaymentConfigDto) { } 