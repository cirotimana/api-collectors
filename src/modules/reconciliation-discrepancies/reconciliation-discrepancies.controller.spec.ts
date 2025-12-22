import { Test, TestingModule } from '@nestjs/testing';
import { ReconciliationDiscrepanciesController } from './reconciliation-discrepancies.controller';

describe('ReconciliationDiscrepanciesController', () => {
  let controller: ReconciliationDiscrepanciesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReconciliationDiscrepanciesController],
    }).compile();

    controller = module.get<ReconciliationDiscrepanciesController>(ReconciliationDiscrepanciesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
