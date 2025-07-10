import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseInterceptors, UploadedFile, ConflictException, BadRequestException, HttpStatus, DefaultValuePipe } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { GetClientsSummaryDto } from './dto/get-clients-summary.dto';
import { Public } from '../auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createHash } from 'crypto';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Crear el directorio de uploads para clientes si no existe
const uploadDir = join(process.cwd(), 'uploads/clients');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const hash = createHash('md5')
      .update(file.originalname + Date.now().toString())
      .digest('hex')
      .substring(0, 8);
    cb(null, `${hash}${extname(file.originalname)}`);
  }
});

@Controller('client')
export class ClientController {
  private readonly uploadDir = 'uploads/clients';

  constructor(private readonly clientService: ClientService) { }

  @Post()
  @UseInterceptors(FileInterceptor('referenceImage', {
    storage,
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(null, false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB
    }
  }))
  async create(@Body() createClientDto: CreateClientDto, @UploadedFile() file?: Express.Multer.File) {
    try {
      // Crear el cliente dentro de una transacción
      // La validación del DNI se realiza dentro de createWithTransaction
      const result = await this.clientService.createWithTransaction(createClientDto);

      console.log('Cliente creado:', {
        id: result.id,
        dni: result.dni
      });

      return result;
    } catch (error) {
      console.error('Error al crear cliente:', error);

      // Si es un error conocido, lo lanzamos tal cual
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }

      // Para otros errores, lanzamos un error genérico
      throw new BadRequestException('Error al crear el cliente. Por favor, inténtelo de nuevo.');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto
  ) {
    return this.clientService.update(id, updateClientDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string[],
    @Query('services') services?: string[],
    @Query('minCost') minCost?: string,
    @Query('maxCost') maxCost?: string,
    @Query('sectors') sectors?: string[]
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const parsedMinCost = minCost ? parseInt(minCost, 10) : undefined;
    const parsedMaxCost = maxCost ? parseInt(maxCost, 10) : undefined;

    if (isNaN(parsedPage) || isNaN(parsedLimit)) {
      throw new BadRequestException('Los parámetros de paginación deben ser números válidos');
    }

    if ((minCost && isNaN(parsedMinCost)) || (maxCost && isNaN(parsedMaxCost))) {
      throw new BadRequestException('Los parámetros de costo deben ser números válidos');
    }

    return this.clientService.findAll(
      parsedPage,
      parsedLimit,
      search,
      status,
      services,
      parsedMinCost,
      parsedMaxCost,
      sectors
    );
  }

  @Get('summary')
  getSummary(@Query() getClientsSummaryDto: GetClientsSummaryDto) {
    return this.clientService.getSummary(getClientsSummaryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.remove(id);
  }

  @Public()
  @Post('update-all-states')
  async updateAllStates() {
    const { data: clients } = await this.clientService.findAll(1, 9999); // Obtener todos los clientes
    const results = [];

    for (const client of clients) {
      try {
        const updatedClient = await this.clientService.updateClientStatus(client.id);
        results.push({
          id: client.id,
          name: client.name,
          oldStatus: client.status,
          newStatus: updatedClient.status
        });
      } catch (error) {
        results.push({
          id: client.id,
          name: client.name,
          error: error.message
        });
      }
    }

    return {
      message: 'Estados de clientes actualizados correctamente',
      results
    };
  }

  @Get('validate-dni/:dni')
  async validateDni(@Param('dni') dni: string) {
    try {
      // Validar formato del DNI
      if (!/^\d{8}$/.test(dni)) {
        return {
          valid: false,
          message: 'El DNI debe contener exactamente 8 dígitos'
        };
      }

      // Verificar si el DNI ya existe
      const exists = await this.clientService.checkDniExists(dni);
      return {
        valid: !exists,
        message: exists ? 'El DNI ya está registrado' : 'DNI disponible'
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Error al validar el DNI'
      };
    }
  }

  @Public()
  @Post('sync-states')
  async syncStates() {
    await this.clientService.syncAllClientsPaymentStatus();
    return { message: 'Estados sincronizados correctamente' };
  }
}
