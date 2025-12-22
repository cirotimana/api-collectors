import { Test, TestingModule } from '@nestjs/testing';
import { ReconciliationDiscrepanciesService } from './reconciliation-discrepancies.service';

describe('ReconciliationDiscrepanciesService', () => {
  let service: ReconciliationDiscrepanciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReconciliationDiscrepanciesService],
    }).compile();

    service = module.get<ReconciliationDiscrepanciesService>(ReconciliationDiscrepanciesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
