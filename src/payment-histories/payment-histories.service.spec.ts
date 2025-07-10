import { Test, TestingModule } from '@nestjs/testing';
import { PaymentHistoriesService } from './payment-histories.service';

describe('PaymentHistoriesService', () => {
  let service: PaymentHistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentHistoriesService],
    }).compile();

    service = module.get<PaymentHistoriesService>(PaymentHistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
