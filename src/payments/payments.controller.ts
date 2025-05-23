import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPaymentsSummaryDto } from './dto/get-payments-summary.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get('summary')
  getSummary(@Query() getPaymentsSummaryDto: GetPaymentsSummaryDto) {
    return this.paymentsService.getSummary(getPaymentsSummaryDto);
  }

  @Get()
  findAll(@Query('client') clientId?: string) {
    return this.paymentsService.findAll(clientId ? parseInt(clientId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePaymentDto: Partial<CreatePaymentDto>) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }
}
