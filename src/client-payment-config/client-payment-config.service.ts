import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientPaymentConfigDto } from './dto/create-client-payment-config.dto';
import { UpdateClientPaymentConfigDto } from './dto/update-client-payment-config.dto';
import { ClientPaymentConfig, PaymentConfigStatus } from './entities/client-payment-config.entity';

@Injectable()
export class ClientPaymentConfigService {
  constructor(
    @InjectRepository(ClientPaymentConfig)
    private readonly clientPaymentConfigRepository: Repository<ClientPaymentConfig>,
  ) { }

  create(createClientPaymentConfigDto: CreateClientPaymentConfigDto) {
    const clientPaymentConfig = this.clientPaymentConfigRepository.create(createClientPaymentConfigDto);
    return this.clientPaymentConfigRepository.save(clientPaymentConfig);
  }

  findAll() {
    return this.clientPaymentConfigRepository.find();
  }

  findOne(id: number) {
    return this.clientPaymentConfigRepository.findOne({ where: { id } });
  }

  async update(id: number, updateClientPaymentConfigDto: UpdateClientPaymentConfigDto) {
    const existingConfig = await this.findOne(id);
    if (!existingConfig) {
      throw new NotFoundException(`Configuración de pagos con ID ${id} no encontrada`);
    }

    // Usar save en lugar de update para evitar conflictos
    const updatedConfig = this.clientPaymentConfigRepository.merge(existingConfig, updateClientPaymentConfigDto);
    return await this.clientPaymentConfigRepository.save(updatedConfig);
  }

  remove(id: number) {
    return this.clientPaymentConfigRepository.delete(id);
  }
} 