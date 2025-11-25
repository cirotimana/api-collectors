import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collector } from '../entities/collector.entity';

@Injectable()
export class CollectorsService {
  constructor(
    @InjectRepository(Collector)
    private collectorRepository: Repository<Collector>,
  ) {}

  async findAll(): Promise<Collector[]> {
    return await this.collectorRepository.find({
      relations: ['createdBy', 'updatedBy'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Collector | null> {
    return await this.collectorRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy'],
    });
  }
}