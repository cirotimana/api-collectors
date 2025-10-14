import { Test, TestingModule } from '@nestjs/testing';
import { LiquidationsController } from './liquidations.controller';

describe('LiquidationsController', () => {
  let controller: LiquidationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiquidationsController],
    }).compile();

    controller = module.get<LiquidationsController>(LiquidationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
