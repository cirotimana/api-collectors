import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findByPeriod(period: string) {
    return await this.liquidationRepository.find({
      where: { period },
      relations: ['collector', 'createdBy', 'files'],
      order: { createdAt: 'DESC' },
    });
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
}