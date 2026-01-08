import { Injectable } from '@nestjs/common';
import { Collector } from '../entities/collector.entity';
import { CollectorsRepository } from '../repository/collectors.repository';

@Injectable()
export class CollectorsService {
  constructor(
    private collectorsRepository: CollectorsRepository,
  ) {}

  async findAll(): Promise<Collector[]> {
    return await this.collectorsRepository.findAll();
  }

  async findOne(id: number): Promise<Collector | null> {
    return await this.collectorsRepository.findOne(id);
  }
}
