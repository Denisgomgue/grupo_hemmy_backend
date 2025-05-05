import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, AccountStatus } from './entities/client.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) { }

  async create(createClientDto: CreateClientDto) {
    const client = this.clientRepository.create({
      ...createClientDto,
      plan: createClientDto.plan ? { id: createClientDto.plan } : null,
      sector: createClientDto.sector ? { id: createClientDto.sector } : null,
    });

    return await this.clientRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    const clients = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.plan', 'plan')
      .leftJoinAndSelect('plan.service', 'service')
      .leftJoinAndSelect('client.sector', 'sector')
      .getMany();

    return clients;
  }

  async findOne(id: number) {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.plan', 'plan')
      .leftJoinAndSelect('plan.service', 'service')
      .leftJoinAndSelect('client.sector', 'sector')
      .where('client.id = :id', { id })
      .getOne();

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const clientData: Partial<Client> = {};

    if (updateClientDto.name !== undefined) clientData.name = updateClientDto.name;
    if (updateClientDto.lastName !== undefined) clientData.lastName = updateClientDto.lastName;
    if (updateClientDto.dni !== undefined) clientData.dni = updateClientDto.dni;
    if (updateClientDto.phone !== undefined) clientData.phone = updateClientDto.phone;
    if (updateClientDto.address !== undefined) clientData.address = updateClientDto.address;
    if (updateClientDto.reference !== undefined) clientData.reference = updateClientDto.reference;
    if (updateClientDto.advancePayment !== undefined) clientData.advancePayment = updateClientDto.advancePayment;
    if (updateClientDto.status !== undefined) clientData.status = updateClientDto.status;
    if (updateClientDto.description !== undefined) clientData.description = updateClientDto.description;

    if (updateClientDto.installationDate !== undefined) {
        clientData.installationDate = updateClientDto.installationDate ? new Date(updateClientDto.installationDate) : null;
    }
    if (updateClientDto.paymentDate !== undefined) {
        clientData.paymentDate = updateClientDto.paymentDate ? new Date(updateClientDto.paymentDate) : null;
    }

    if (updateClientDto.plan !== undefined) {
      clientData.plan = updateClientDto.plan ? { id: updateClientDto.plan } as any : null;
    }
    if (updateClientDto.sector !== undefined) {
      clientData.sector = updateClientDto.sector ? { id: updateClientDto.sector } as any : null;
    }

    const client = await this.clientRepository.preload({
      id,
      ...clientData,
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return await this.clientRepository.save(client);
  }

  async remove(id: number) {
    const client = await this.findOne(id);
    return await this.clientRepository.remove(client);
  }
}