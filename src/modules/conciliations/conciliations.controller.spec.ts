import { Test, TestingModule } from '@nestjs/testing';
import { ConciliationsController } from './conciliations.controller';

describe('ConciliationsController', () => {
  let controller: ConciliationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConciliationsController],
    }).compile();

    controller = module.get<ConciliationsController>(ConciliationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
