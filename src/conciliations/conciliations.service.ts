import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conciliation } from '../entities/conciliation.entity';

@Injectable()
export class ConciliationsService {
  constructor(
    @InjectRepository(Conciliation)
    private conciliationRepository: Repository<Conciliation>,
  ) {}

  async findAll() {
    return await this.conciliationRepository.find({
      relations: ['collector', 'createdBy', 'files'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    return await this.conciliationRepository.findOne({
      where: { id },
      relations: ['collector', 'createdBy', 'files'],
    });
  }

  async findByPeriod(period: string) {
    return await this.conciliationRepository.find({
      where: { period },
      relations: ['collector', 'createdBy', 'files'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStats() {
    const total = await this.conciliationRepository.count();
    const completed = await this.conciliationRepository.count({
      where: { conciliationsState: true },
    });
    const pending = total - completed;

    const totalAmount = await this.conciliationRepository
      .createQueryBuilder('c')
      .select('SUM(c.amount)', 'sum')
      .getRawOne();

    return {
      total,
      completed,
      pending,
      totalAmount: parseFloat(totalAmount.sum) || 0,
    };
  }
}