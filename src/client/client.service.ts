import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, AccountStatus } from './entities/client.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';

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

    console.log(`Cliente ID: ${id}, paymentStatus calculado por getEstadoGeneralCliente: `, estadoGeneral);

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
    if (updateClientDto.decoSerial !== undefined) clientData.decoSerial = updateClientDto.decoSerial;
    if (updateClientDto.routerSerial !== undefined) clientData.routerSerial = updateClientDto.routerSerial;

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
    const pagos = await this.paymentRepository.find({
      where: { client: { id: clienteId } },
    
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    if (pagos.length === 0) {
      return 'Sin pagos';
    }

    let tienePendiente = false;
    let tienePorVencer = false;
    let tieneVencido = false;
    let tieneSuspendido = false;

    for (const pago of pagos) {
      const fechaVencimiento = new Date(pago.dueDate);
      fechaVencimiento.setHours(0, 0, 0, 0);

      if (pago.state === PaymentStatus.PENDING) {
        tienePendiente = true;
        // Continuar para evaluar todos los pagos, la prioridad se encargará del estado final.
      }

      if (!pago.paymentDate) { // El pago no se ha realizado
        // (Si también es PENDIENTE, tienePendiente ya está en true)
        const diasDesdeVencimiento = Math.ceil((hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));

        if (diasDesdeVencimiento > 7) { // Más de 7 días después de la fecha de vencimiento
          tieneSuspendido = true;
        } else if (diasDesdeVencimiento > 0) { // De 1 a 7 días vencido
          tieneVencido = true;
        } else { // Aún no está vencido o vence hoy
          const diasParaVencer = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
   
          if (diasParaVencer >= 0 && diasParaVencer < 7) { // Vence en 0-6 días
            tienePorVencer = true;
          }
        }
      } else {
        tienePendiente = true;
      }
    }

    // Condición para "Al día": el último pago requerido esté completado y al día.
    // Esto se verifica DESPUÉS de los estados prioritarios.
    let ultimoPagoRequeridoCompletadoYAlDia = false;
    if (pagos.length > 0) {
      // Encontrar la fecha de vencimiento (dueDate) más reciente entre todos los pagos
      const ultimaFechaVencimientoEpoch = Math.max(...pagos.map(p => new Date(p.dueDate).getTime()));
      // Filtrar todos los pagos que coincidan con esta última fecha de vencimiento
      const ultimosPagosRequeridos = pagos.filter(p => new Date(p.dueDate).getTime() === ultimaFechaVencimientoEpoch);

      if (ultimosPagosRequeridos.length > 0) {
        ultimoPagoRequeridoCompletadoYAlDia = ultimosPagosRequeridos.every(up =>
          up.paymentDate && // Debe estar pagado
          up.state !== PaymentStatus.PENDING &&
          new Date(up.paymentDate).setHours(0,0,0,0) <= new Date(up.dueDate).setHours(0,0,0,0) // Debe pagarse en o antes de la fecha de vencimiento
        );
      }
    }

    // Devolver el estado según la prioridad
    if (tienePendiente) return 'Pendiente';
    if (tieneSuspendido) return 'Suspendido'; // Cumple "mas de 7 dias despues de la fecha de pago [vencimiento]"
    if (tieneVencido) return 'Vencido';
    if (tienePorVencer) return 'Por vencer';

    // Si llegamos aquí, no hay deudas PENDIENTE, SUSPENDIDO, VENCIDO o POR VENCER.
    // Esto cumple la parte de "no hay deudas" de la condición "Al día".
    // Ahora verificamos si "el ultimo pago de la fecha este completado o pagado".
    if (ultimoPagoRequeridoCompletadoYAlDia) {
      return 'Al día';
    }

    // Fallback: Si ninguna de las condiciones anteriores se cumple.
    // Ej: Pagos existen pero no caen en P, S, V, PV y el último no está "completado y al día"
    // (podría ser un pago futuro no cercano, o un último pago que se hizo tarde pero no hay otras deudas).
    // La lógica original retornaba 'Sin pagos' aquí.
    return 'Sin pagos'; // O un estado más descriptivo si es necesario para estos casos.
  }
}