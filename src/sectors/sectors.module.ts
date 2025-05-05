import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectorsService } from './sectors.service';
import { SectorsController } from './sectors.controller';
import { Sector } from './entities/sector.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sector])],
  controllers: [SectorsController],
  providers: [SectorsService],
  exports: [SectorsService]
})
export class SectorsModule {}
