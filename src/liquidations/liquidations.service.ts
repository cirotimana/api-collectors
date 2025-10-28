import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Liquidation } from '../entities/liquidation.entity';

@Injectable()
export class LiquidationsService {
  constructor(
    @InjectRepository(Liquidation)
    private liquidationRepository: Repository<Liquidation>,
  ) {}

  async findAll() {
    return await this.liquidationRepository.find({
      relations: ['collector', 'createdBy', 'files'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    return await this.liquidationRepository.findOne({
      where: { id },
      relations: ['collector', 'createdBy', 'files'],
    });
  }

  async findByDateRange(from: string, to: string) {
  return await this.liquidationRepository
    .createQueryBuilder('liquidation')
    .leftJoinAndSelect('liquidation.collector', 'collector')
    .leftJoinAndSelect('liquidation.createdBy', 'createdBy')
    .leftJoinAndSelect('liquidation.files', 'files')
    .where('DATE(liquidation.fromDate) >= DATE(:from)', { from })
    .andWhere('DATE(liquidation.toDate) <= DATE(:to)', { to })
    .orderBy('liquidation.fromDate', 'DESC')
    .getMany();
  }

  async getStats() {
    const total = await this.liquidationRepository.count();
    const completed = await this.liquidationRepository.count({
      where: { liquidationsState: true },
    });
    const pending = total - completed;

    const totalAmount = await this.liquidationRepository
      .createQueryBuilder('l')
      .select('SUM(l.amount_liquidation)', 'sum')
      .getRawOne();

    return {
      total,
      completed,
      pending,
      totalAmount: parseFloat(totalAmount.sum) || 0,
    };
  }

  async findByCollector(collectorName: string) {
    return await this.liquidationRepository
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.collector', 'collector')
      .leftJoinAndSelect('l.createdBy', 'createdBy')
      .leftJoinAndSelect('l.files', 'files')
      .where('LOWER(collector.name) LIKE LOWER(:name)', { name: `%${collectorName}%` })
      .orderBy('l.createdAt', 'DESC')
      .getMany();
  }

  async remove(id: number) {
    const liquidation = await this.liquidationRepository.findOne({ where: { id } });
    if (!liquidation) throw new NotFoundException(`Liquidation ${id} no encontrada`);

    await this.liquidationRepository.remove(liquidation);
    return { message: `Liquidation ${id} eliminada correctamente` };
  }
}
