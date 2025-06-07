import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createHash } from 'crypto';

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
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
        @Body('name') name: string
    ) {
        return {
            url: `/uploads/${file.filename}`,
            originalName: file.originalname,
            size: file.size
        };
    }
} 