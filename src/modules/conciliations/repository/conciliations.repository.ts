import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conciliation } from '../entities/conciliation.entity';

@Injectable()
export class ConciliationsRepository {
  constructor(
    @InjectRepository(Conciliation)
    private conciliationRepository: Repository<Conciliation>,
  ) {}

  async findByDateRange(from: string, to: string): Promise<Conciliation[]> {
    return await this.conciliationRepository
      .createQueryBuilder('conciliation')
      .leftJoinAndSelect('conciliation.collector', 'collector')
      .leftJoinAndSelect('conciliation.createdBy', 'createdBy')
      .leftJoinAndSelect('conciliation.files', 'files')
      .where('DATE(conciliation.fromDate) = DATE(:from)', { from })
      .andWhere('DATE(conciliation.toDate) = DATE(:to)', { to })
      .orderBy('conciliation.fromDate', 'DESC')
      .getMany();
  }

  async findAll(): Promise<Conciliation[]> {
    return await this.conciliationRepository.find({
      relations: ['collector', 'createdBy', 'files'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Conciliation | null> {
    return await this.conciliationRepository.findOne({
      where: { id },
      relations: ['collector', 'createdBy', 'files'],
    });
  }

  async findByCollector(collectorName: string): Promise<Conciliation[]> {
    return await this.conciliationRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.collector', 'collector')
      .leftJoinAndSelect('c.createdBy', 'createdBy')
      .leftJoinAndSelect('c.files', 'files')
      .where('LOWER(collector.name) LIKE LOWER(:name)', { name: `%${collectorName}%` })
      .orderBy('c.createdAt', 'DESC')
      .getMany();
  }

  async remove(id: number): Promise<void> {
    const conciliation = await this.conciliationRepository.findOne({ where: { id } });
    if (!conciliation) {
      throw new Error(`Conciliation ${id} no encontrada`);
    }
    await this.conciliationRepository.remove(conciliation);
  }

  async getStats(collectorId: number, fromDate?: string, toDate?: string): Promise<any> {
    const query = `
      SELECT * 
      FROM get_conciliations_summary(
        $1,
        COALESCE($2::date, NULL),
        COALESCE($3::date, NULL)
      )
    `;

    const [result] = await this.conciliationRepository.query(query, [
      collectorId,
      fromDate || null,
      toDate || null,
    ]);

    return {
      totalAmount: parseFloat(result?.total_amount) || 0,
      totalAmountCollector: parseFloat(result?.total_amount_collector) || 0,
    };
  }

  async getSummary(collectorIds: number[], fromDate?: string, toDate?: string): Promise<any[]> {
    const query = `
      SELECT *
      FROM get_conciliations_summary_by_day(
        $1::int[],
        COALESCE($2::date, NULL),
        COALESCE($3::date, NULL)
      )
    `;

    return await this.conciliationRepository.query(query, [
      collectorIds,
      fromDate || null,
      toDate || null,
    ]);
  }
}

