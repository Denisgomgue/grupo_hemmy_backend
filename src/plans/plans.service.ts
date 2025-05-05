import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createPlanDto: CreatePlanDto) {
    const service = await this.serviceRepository.findOne({
      where: { id: createPlanDto.service }
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    // Convertir speed a número si existe
    const speedAsNumber = createPlanDto.speed ? parseFloat(createPlanDto.speed) : undefined;
    if (createPlanDto.speed && isNaN(speedAsNumber)) {
        throw new Error('La velocidad proporcionada no es un número válido.'); // O manejar el error como prefieras
    }

    // Crear el plan asegurándose de que speed sea number y asignando el objeto service
    const plan = this.planRepository.create({
      name: createPlanDto.name,
      description: createPlanDto.description,
      price: createPlanDto.price,
      speed: speedAsNumber, // Usar el valor convertido a número
      service: service // Asignar el objeto Service completo
      // No pasar service explícitamente aquí si asignamos el objeto service
    });

    return this.planRepository.save(plan);
  }

  findAll() {
    return this.planRepository.find({
      relations: ['service']
    });
  }

  async findOne(id: number) {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['service']
    });

    if (!plan) {
      throw new NotFoundException('Plan no encontrado');
    }

    return plan;
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    const plan = await this.findOne(id);

    if (updatePlanDto.service) {
      const service = await this.serviceRepository.findOne({
        where: { id: updatePlanDto.service }
      });
      if (!service) {
        throw new NotFoundException('Servicio no encontrado');
      }
      plan.service = service;
    }

    Object.assign(plan, updatePlanDto);
    return this.planRepository.save(plan);
  }

  async remove(id: number) {
    const plan = await this.findOne(id);
    return this.planRepository.remove(plan);
  }
}
