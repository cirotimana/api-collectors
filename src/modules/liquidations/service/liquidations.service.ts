import { Injectable, NotFoundException } from '@nestjs/common';
import { Liquidation } from '../entities/liquidation.entity';
import { LiquidationsRepository } from '../repository/liquidations.repository';

@Injectable()
export class LiquidationsService {
  constructor(
    private liquidationsRepository: LiquidationsRepository,
  ) {}

  async findAll() {
    return await this.liquidationsRepository.findAll();
  }

  async findOne(id: number) {
    return await this.liquidationsRepository.findOne(id);
  }

  async findByDateRange(from: string, to: string) {
    return await this.liquidationsRepository.findByDateRange(from, to);
  }

  async getStats(collectorId: number, fromDate?: string, toDate?: string) {
    return await this.liquidationsRepository.getStats(collectorId, fromDate, toDate);
  }

  async getSummary(collectorIds: number[], fromDate?: string, toDate?: string) {
    return await this.liquidationsRepository.getSummary(collectorIds, fromDate, toDate);
  }

  async findByCollector(collectorName: string) {
    return await this.liquidationsRepository.findByCollector(collectorName);
  }

  async remove(id: number) {
    try {
      await this.liquidationsRepository.remove(id);
      return { message: `Liquidation ${id} eliminada correctamente` };
    } catch (error) {
      throw new NotFoundException(`Liquidation ${id} no encontrada`);
    }
  }
}
