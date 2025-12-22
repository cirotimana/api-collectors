import { Test, TestingModule } from '@nestjs/testing';
import { LiquidationsService } from './liquidations.service';

describe('LiquidationsService', () => {
  let service: LiquidationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiquidationsService],
    }).compile();

    service = module.get<LiquidationsService>(LiquidationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
