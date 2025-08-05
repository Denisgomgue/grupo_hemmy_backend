import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createHash } from 'crypto';
import { existsSync, mkdirSync } from 'fs';

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, callback) => {
                // Obtener la carpeta del body o usar 'clients' por defecto
                const folder = req.body.folder || 'clients';
                const uploadPath = join('./uploads', folder);

                // Crear la carpeta si no existe
                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath, { recursive: true });
                }

                callback(null, uploadPath);
            },
            filename: (req, file, callback) => {
                // Obtener el nombre base del archivo
                const name = req.body.name || 'file';

                // Crear un hash del nombre original + timestamp para evitar colisiones
                const hash = createHash('md5')
                    .update(file.originalname + Date.now().toString())
                    .digest('hex')
                    .substring(0, 8);

                // Construir el nombre final: nombre_hash.extensión
                const fileName = `${name}_${hash}${extname(file.originalname)}`;
                callback(null, fileName);
            }
        }),
        fileFilter: (req, file, callback) => {
            // Validar tipo de archivo
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                return callback(new Error('Solo se permiten archivos de imagen'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 2 * 1024 * 1024 // 2MB
        }
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('name') name: string,
        @Body('folder') folder: string
    ) {
        const folderPath = folder || 'clients';
        return {
            filename: `uploads/${folderPath}/${file.filename}`,
            url: `/uploads/${folderPath}/${file.filename}`,
            originalName: file.originalname,
            size: file.size
        };
    }
} 