import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { DatabaseSeederService } from './database-seeders.service';

@Injectable()
export class DatabaseSeederCommand {
    constructor(private readonly databaseSeederService: DatabaseSeederService) { }

    @Command({
        command: 'db:seed',
        describe: 'Seed the database with initial data',
    })
    async seed() {
        console.log('Starting database seeding...');
        await this.databaseSeederService.seed();
        console.log('Database seeding completed successfully.');
    }
}
