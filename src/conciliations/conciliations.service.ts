import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Conciliation } from '../entities/conciliation.entity';

@Injectable()
export class ConciliationsService {
  constructor(
    @InjectRepository(Conciliation)
    private conciliationRepository: Repository<Conciliation>,
  ) {}

  async findByDateRange(from: string, to: string) {
  return await this.conciliationRepository
    .createQueryBuilder('conciliation')
    .leftJoinAndSelect('conciliation.collector', 'collector')
    .leftJoinAndSelect('conciliation.createdBy', 'createdBy')
    .leftJoinAndSelect('conciliation.files', 'files')
    .where('DATE(conciliation.fromDate) >= DATE(:from)', { from })
    .andWhere('DATE(conciliation.toDate) <= DATE(:to)', { to })
    .orderBy('conciliation.fromDate', 'DESC')
    .getMany();
  }

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

  

  

  async findByCollector(collectorName: string) {
    return await this.conciliationRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.collector', 'collector')
      .leftJoinAndSelect('c.createdBy', 'createdBy')
      .leftJoinAndSelect('c.files', 'files')
      .where('LOWER(collector.name) LIKE LOWER(:name)', { name: `%${collectorName}%` })
      .orderBy('c.createdAt', 'DESC')
      .getMany();
  }

  async remove(id: number) {
    const conciliation = await this.conciliationRepository.findOne({ where: { id } });
    if (!conciliation) throw new NotFoundException(`Conciliation ${id} no encontrada`);

    await this.conciliationRepository.remove(conciliation);
    return { message: `Conciliation ${id} eliminada correctamente` };
  }

  async getStats() {
    const total = await this.conciliationRepository.count();
    const completed = await this.conciliationRepository.count({
      // where: { conciliationsState: true },
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
