import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommandService } from 'nestjs-command';

async function bootstrap() {
    // Deshabilitar Console Ninja si está presente
    process.env.CONSOLE_NINJA_DISABLED = 'true';

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: console,
    });

    try {
        const commandService = app.get(CommandService);
        await commandService.exec();
        await app.close();
        console.log('✅ Seed ejecutado correctamente.');
    } catch (error) {
        console.error('❌ Error ejecutando seed:', error);
        process.exit(1);
    }
}

bootstrap();