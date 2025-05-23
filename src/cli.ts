import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommandService } from 'nestjs-command';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('CLI');
    // Deshabilitar Console Ninja si está presente
    process.env.CONSOLE_NINJA_DISABLED = 'true';

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: [ 'error', 'warn', 'log', 'debug', 'verbose' ],
    });

    try {
        const commandService = app.get(CommandService);
        await commandService.exec();
        await app.close();
        logger.log('✅ Seed ejecutado correctamente.');
    } catch (error) {
        logger.error('❌ Error ejecutando seed:', error.stack);
        process.exit(1);
    }
}

bootstrap();