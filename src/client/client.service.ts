import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, AccountStatus } from './entities/client.entity';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
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

    // Calcula el estado general
    const estadoGeneral = await this.getEstadoGeneralCliente(id);

    // Retorna el cliente con el estado general SOLO para la respuesta
    return Object.assign({}, client, { paymentStatus: estadoGeneral });
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

  async getEstadoGeneralCliente(clienteId: number): Promise<string> {
    const pagos = await this.paymentRepository.find({ where: { client: { id: clienteId } } });
    const hoy = new Date();
    let tienePendiente = false;
    let tienePorVencer = false;
    let tieneVencido = false;
    let tieneSuspendido = false;
    let todosAlDia = true;

    for (const pago of pagos) {
      if (pago.state === 'PENDIENTE') {
        tienePendiente = true;
        todosAlDia = false;
        continue;
      }
      if (!pago.paymentDate) {
        const fechaVencimiento = new Date(pago.dueDate);
        const diasParaVencer = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        const diasAtraso = Math.ceil((hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));
        todosAlDia = false;
        if (diasParaVencer < 7 && diasParaVencer >= 0) {
          tienePorVencer = true;
        } else if (diasAtraso > 0 && diasAtraso <= 7) {
          tieneVencido = true;
        } else if (diasAtraso > 7) {
          tieneSuspendido = true;
        }
      } else {
        // Si el pago se hizo después del vencimiento, no está al día
        const fechaVencimiento = new Date(pago.dueDate);
        const fechaPago = new Date(pago.paymentDate);
        if (fechaPago > fechaVencimiento) {
          todosAlDia = false;
        }
      }
    }

    if (tienePendiente) return 'Pendiente';
    if (tieneSuspendido) return 'Suspendido';
    if (tieneVencido) return 'Vencido';
    if (tienePorVencer) return 'Por vencer';
    if (todosAlDia) return 'Al día';
    return 'Sin pagos';
  }
}