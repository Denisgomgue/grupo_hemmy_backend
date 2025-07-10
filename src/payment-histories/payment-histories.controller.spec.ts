import { Test, TestingModule } from '@nestjs/testing';
import { PaymentHistoriesController } from './payment-histories.controller';
import { PaymentHistoriesService } from './payment-histories.service';

describe('PaymentHistoriesController', () => {
  let controller: PaymentHistoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentHistoriesController],
      providers: [PaymentHistoriesService],
    }).compile();

    controller = module.get<PaymentHistoriesController>(PaymentHistoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
