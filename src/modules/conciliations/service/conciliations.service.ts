import { Injectable, NotFoundException } from '@nestjs/common';
import { Conciliation } from '../entities/conciliation.entity';
import { ConciliationsRepository } from '../repository/conciliations.repository';

@Injectable()
export class ConciliationsService {
  constructor(
    private conciliationsRepository: ConciliationsRepository,
  ) {}

  async findByDateRange(from: string, to: string) {
    return await this.conciliationsRepository.findByDateRange(from, to);
  }

  async findAll() {
    return await this.conciliationsRepository.findAll();
  }

  async findOne(id: number) {
    return await this.conciliationsRepository.findOne(id);
  }

  async findByCollector(collectorName: string) {
    return await this.conciliationsRepository.findByCollector(collectorName);
  }

  async remove(id: number) {
    try {
      await this.conciliationsRepository.remove(id);
      return { message: `Conciliation ${id} eliminada correctamente` };
    } catch (error) {
      throw new NotFoundException(`Conciliation ${id} no encontrada`);
    }
  }

  async getStats(collectorId: number, fromDate?: string, toDate?: string) {
    return await this.conciliationsRepository.getStats(collectorId, fromDate, toDate);
  }

  async getSummary(collectorIds: number[], fromDate?: string, toDate?: string) {
    return await this.conciliationsRepository.getSummary(collectorIds, fromDate, toDate);
  }
}
