import { Injectable, Logger } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { DatabaseSeederService } from './database-seeders.service';

@Injectable()
export class DatabaseSeederCommand {
    private readonly logger = new Logger(DatabaseSeederCommand.name);

    constructor(private readonly databaseSeederService: DatabaseSeederService) { }

    @Command({
        command: 'db:seed',
        describe: 'Seed the database with initial data',
    })
    async seed() {
        this.logger.log('Iniciando proceso de seeding en la base de datos...');
        await this.databaseSeederService.seed();
        this.logger.log('Proceso de seeding completado exitosamente.');
    }
}
