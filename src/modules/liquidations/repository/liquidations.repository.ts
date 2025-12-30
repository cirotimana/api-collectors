import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Liquidation } from '../entities/liquidation.entity';

@Injectable()
export class LiquidationsRepository {
  constructor(
    @InjectRepository(Liquidation)
    private liquidationRepository: Repository<Liquidation>,
  ) {}

  async findAll(): Promise<Liquidation[]> {
    return await this.liquidationRepository.find({
      relations: ['collector', 'createdBy', 'files'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Liquidation | null> {
    return await this.liquidationRepository.findOne({
      where: { id },
      relations: ['collector', 'createdBy', 'files'],
    });
  }

  async findByDateRange(from: string, to: string): Promise<Liquidation[]> {
    return await this.liquidationRepository
      .createQueryBuilder('liquidation')
      .leftJoinAndSelect('liquidation.collector', 'collector')
      .leftJoinAndSelect('liquidation.createdBy', 'createdBy')
      .leftJoinAndSelect('liquidation.files', 'files')
      .where('DATE(liquidation.fromDate) = DATE(:from)', { from })
      .andWhere('DATE(liquidation.toDate) = DATE(:to)', { to })
      .orderBy('liquidation.fromDate', 'DESC')
      .getMany();
  }

  async getStats(collectorId: number, fromDate?: string, toDate?: string): Promise<any> {
    const query = `
      SELECT * 
      FROM get_liquidations_summary(
        $1,
        COALESCE($2::date, NULL),
        COALESCE($3::date, NULL)
      )
    `;

    const [result] = await this.liquidationRepository.query(query, [
      collectorId,
      fromDate || null,
      toDate || null,
    ]);

    return {
      totalAmountCollector: parseFloat(result?.total_amount_collector) || 0,
      totalAmountLiquidation: parseFloat(result?.total_amount_liquidation) || 0,
    };
  }

  async getSummary(collectorIds: number[], fromDate?: string, toDate?: string): Promise<any[]> {
    const query = `
      SELECT *
      FROM get_liquidations_summary_by_day(
        $1::int[],
        COALESCE($2::date, NULL),
        COALESCE($3::date, NULL)
      )
    `;

    return await this.liquidationRepository.query(query, [
      collectorIds,
      fromDate || null,
      toDate || null,
    ]);
  }

  async findByCollector(collectorName: string): Promise<Liquidation[]> {
    return await this.liquidationRepository
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.collector', 'collector')
      .leftJoinAndSelect('l.createdBy', 'createdBy')
      .leftJoinAndSelect('l.files', 'files')
      .where('LOWER(collector.name) LIKE LOWER(:name)', { name: `%${collectorName}%` })
      .orderBy('l.createdAt', 'DESC')
      .getMany();
  }

  async remove(id: number): Promise<void> {
    const liquidation = await this.liquidationRepository.findOne({ where: { id } });
    if (!liquidation) {
      throw new Error(`Liquidation ${id} no encontrada`);
    }
    await this.liquidationRepository.remove(liquidation);
  }
}

