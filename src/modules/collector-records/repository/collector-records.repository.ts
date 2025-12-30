import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectorRecord } from '../entities/collector-record.entity';
import { PAGINATION } from '../../../common/constants/constants';

@Injectable()
export class CollectorRecordsRepository {
  constructor(
    @InjectRepository(CollectorRecord)
    private collectorRecordRepository: Repository<CollectorRecord>,
  ) {}

  async create(recordData: Partial<CollectorRecord>): Promise<CollectorRecord> {
    const record = this.collectorRecordRepository.create(recordData);
    return await this.collectorRecordRepository.save(record);
  }

  async findAll(): Promise<CollectorRecord[]> {
    return await this.collectorRecordRepository.find({
      relations: ['collector'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CollectorRecord | null> {
    return await this.collectorRecordRepository.findOne({
      where: { id },
      relations: ['collector'],
    });
  }

  async findByCalimacoId(calimacoIdNormalized: string): Promise<CollectorRecord[]> {
    return await this.collectorRecordRepository.find({
      where: { calimacoIdNormalized },
      relations: ['collector'],
      order: { recordDate: 'DESC' },
    });
  }

  async update(id: number, updateData: Partial<CollectorRecord>): Promise<CollectorRecord> {
    const record = await this.findOne(id);
    if (!record) {
      throw new Error(`Collector record with ID ${id} not found`);
    }
    Object.assign(record, updateData);
    return await this.collectorRecordRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    if (!record) {
      throw new Error(`Collector record with ID ${id} not found`);
    }
    await this.collectorRecordRepository.remove(record);
  }

  async findByCollector(collectorId: number): Promise<CollectorRecord[]> {
    return await this.collectorRecordRepository.find({
      where: { collectorId },
      relations: ['collector'],
      order: { recordDate: 'DESC' },
    });
  }

  async findByProviderStatus(
    providerStatus: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    collectorId?: number,
    fromDate?: string,
    toDate?: string,
  ): Promise<{ data: CollectorRecord[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryBuilder = this.collectorRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.collector', 'collector')
      .where('record.providerStatus = :providerStatus', { providerStatus });

    if (collectorId) {
      queryBuilder.andWhere('record.collectorId = :collectorId', { collectorId });
    }

    if (fromDate) {
      const adjustedFromDate = fromDate.includes(':') ? fromDate : `${fromDate} 00:00:00`;
      queryBuilder.andWhere('record.recordDate >= :fromDate', { fromDate: adjustedFromDate });
    }

    if (toDate) {
      const adjustedToDate = toDate.includes(':') ? toDate : `${toDate} 23:59:59`;
      queryBuilder.andWhere('record.recordDate <= :toDate', { toDate: adjustedToDate });
    }

    const total = await queryBuilder.getCount();
    const records = await queryBuilder
      .orderBy('record.recordDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findWithFilters(
    collectorId?: number,
    fromDate?: string,
    toDate?: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    providerStatus?: string,
  ): Promise<{ data: CollectorRecord[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryBuilder = this.collectorRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.collector', 'collector');

    if (collectorId) {
      queryBuilder.andWhere('record.collectorId = :collectorId', { collectorId });
    }

    if (fromDate) {
      const adjustedFromDate = fromDate.includes(':') ? fromDate : `${fromDate} 00:00:00`;
      queryBuilder.andWhere('record.recordDate >= :fromDate', { fromDate: adjustedFromDate });
    }

    if (toDate) {
      const adjustedToDate = toDate.includes(':') ? toDate : `${toDate} 23:59:59`;
      queryBuilder.andWhere('record.recordDate <= :toDate', { toDate: adjustedToDate });
    }

    if (providerStatus) {
      const statusArray = providerStatus.split(',').map(s => s.trim());
      queryBuilder.andWhere('record.providerStatus IN (:...statusArray)', { statusArray });
    }

    const total = await queryBuilder.getCount();
    const records = await queryBuilder
      .orderBy('record.recordDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

