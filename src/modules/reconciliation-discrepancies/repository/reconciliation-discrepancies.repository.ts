import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReconciliationDiscrepancy } from '../entities/reconciliation-discrepancies.entity';

@Injectable()
export class ReconciliationDiscrepanciesRepository {
  constructor(
    @InjectRepository(ReconciliationDiscrepancy)
    private discrepancyRepository: Repository<ReconciliationDiscrepancy>,
  ) {}

  async findAll(): Promise<ReconciliationDiscrepancy[]> {
    return await this.discrepancyRepository.find({
      relations: ['liquidation', 'liquidation.collector', 'conciliation', 'conciliation.collector'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ReconciliationDiscrepancy | null> {
    return await this.discrepancyRepository.findOne({
      where: { id },
      relations: ['liquidation', 'liquidation.collector', 'conciliation', 'conciliation.collector'],
    });
  }

  async findOneWithoutRelations(id: number): Promise<ReconciliationDiscrepancy | null> {
    return await this.discrepancyRepository.findOne({
      where: { id },
    });
  }

  async updateStatus(id: number, status: string): Promise<void> {
    await this.discrepancyRepository.update(id, { status });
  }

  async save(discrepancy: ReconciliationDiscrepancy): Promise<ReconciliationDiscrepancy> {
    return await this.discrepancyRepository.save(discrepancy);
  }

  async findByStatus(status: string): Promise<ReconciliationDiscrepancy[]> {
    return await this.discrepancyRepository.find({
      where: { status },
      relations: ['liquidation', 'liquidation.collector', 'conciliation', 'conciliation.collector'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number): Promise<void> {
    const discrepancy = await this.discrepancyRepository.findOne({ where: { id } });
    if (!discrepancy) {
      throw new Error(`Discrepancy ${id} no encontrada`);
    }
    await this.discrepancyRepository.remove(discrepancy);
  }
}

