import { Injectable, NotFoundException  } from '@nestjs/common';
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
}