import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Crear el directorio de uploads si no existe
const uploadDir = './uploads';
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir);
}

// Crear subdirectorios comunes
const clientsDir = join(uploadDir, 'clients');
if (!existsSync(clientsDir)) {
    mkdirSync(clientsDir, { recursive: true });
}

@Module({
    imports: [
        MulterModule.register({
            dest: uploadDir,
        }),
    ],
    controllers: [ UploadController ],
})
export class UploadModule { } 