import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentHistoriesService } from './payment-histories.service';
import { CreatePaymentHistoryDto } from './dto/create-payment-history.dto';
import { UpdatePaymentHistoryDto } from './dto/update-payment-history.dto';

@Controller('payment-histories')
export class PaymentHistoriesController {
  constructor(private readonly paymentHistoriesService: PaymentHistoriesService) {}

  @Post()
  create(@Body() createPaymentHistoryDto: CreatePaymentHistoryDto) {
    return this.paymentHistoriesService.create(createPaymentHistoryDto);
  }

  @Get()
  findAll() {
    return this.paymentHistoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentHistoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentHistoryDto: UpdatePaymentHistoryDto) {
    return this.paymentHistoriesService.update(+id, updatePaymentHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentHistoriesService.remove(+id);
  }
}
