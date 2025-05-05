import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { Sector } from './entities/sector.entity';

@Injectable()
export class SectorsService {
  constructor(
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
  ) { }

  async create(createSectorDto: CreateSectorDto) {
    const sector = this.sectorRepository.create(createSectorDto);
    return this.sectorRepository.save(sector);
  }

  findAll() {
    return this.sectorRepository.find();
  }

  async findOne(id: number) {
    const sector = await this.sectorRepository.findOne({
      where: { id },
      relations: [ 'clients' ]
    });

    if (!sector) {
      throw new NotFoundException('Sector no encontrado');
    }

    return sector;
  }

  async update(id: number, updateSectorDto: UpdateSectorDto) {
    const sector = await this.findOne(id);
    Object.assign(sector, updateSectorDto);
    return this.sectorRepository.save(sector);
  }

  async remove(id: number) {
    const sector = await this.findOne(id);
    return this.sectorRepository.remove(sector);
  }
}
