import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { GetClientsSummaryDto } from './dto/get-clients-summary.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) { }

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  @Get('summary')
  getSummary(@Query() getClientsSummaryDto: GetClientsSummaryDto) {
    return this.clientService.getSummary(getClientsSummaryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.remove(id);
  }

  @Public()
  @Post('update-all-states')
  async updateAllStates() {
    const clients = await this.clientService.findAll();
    const results = [];
    
    for (const client of clients) {
      try {
        const updatedClient = await this.clientService.updateClientStatus(client.id);
        results.push({
          id: client.id,
          name: client.name,
          oldStatus: client.paymentStatus,
          newStatus: updatedClient.paymentStatus
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
}
