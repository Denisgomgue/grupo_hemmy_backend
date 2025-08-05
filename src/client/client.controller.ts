import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseInterceptors, UploadedFile, ConflictException, BadRequestException, HttpStatus, DefaultValuePipe, NotFoundException } from '@nestjs/common';
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
  constructor(private readonly clientService: ClientService) { }

  @Post()
  @UseInterceptors(FileInterceptor('referenceImage', { storage }))
  async create(@Body() createDto: CreateClientDto, @UploadedFile() file?: Express.Multer.File) {
    try {
      // Crear cliente

      if (file) {
        // Guardar la ruta completa en lugar de solo el nombre del archivo
        createDto.referenceImage = `uploads/clients/${file.filename}`;
      }
      return this.clientService.create(createDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al crear cliente');
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('referenceImage', { storage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateClientDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    try {
      if (file) {
        // Guardar la ruta completa en lugar de solo el nombre del archivo
        updateDto.referenceImage = `uploads/clients/${file.filename}`;
      }
      return this.clientService.update(id, updateDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar cliente');
    }
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string[],
    @Query('services') services?: string[],
    @Query('minCost') minCost?: string,
    @Query('maxCost') maxCost?: string,
    @Query('sectors') sectors?: string[]
  ) {
    return this.clientService.findAll(
      page,
      limit,
      search,
      status,
      services,
      minCost ? +minCost : undefined,
      maxCost ? +maxCost : undefined,
      sectors
    );
  }

  @Get('validate-dni/:dni')
  async validateDni(
    @Param('dni') dni: string,
    @Query('excludeId') excludeId?: string
  ) {
    const isValid = await this.clientService.validateDni(dni, excludeId ? +excludeId : undefined);
    return { valid: isValid };
  }

  @Post('sync-states')
  async syncStates() {
    await this.clientService.syncAllClientsPaymentStatus();
    return { message: 'Estados de clientes sincronizados correctamente' };
  }

  @Get('search-by-dni/:dni')
  async searchByDni(@Param('dni') dni: string) {
    return this.clientService.findByDni(dni);
  }

  @Get('summary')
  async getSummary(@Query() getClientsSummaryDto: GetClientsSummaryDto) {
    return this.clientService.getSummary(getClientsSummaryDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.remove(id);
  }

  @Post(':id/status')
  async updateClientStatus(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.updateClientStatus(id);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async saveImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó imagen');
    }
    // Guardar la ruta completa en lugar de solo el nombre del archivo
    return this.clientService.saveImage(id, `uploads/clients/${file.filename}`);
  }

  @Delete(':id/image')
  async deleteImage(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.deleteImage(id);
  }
}
