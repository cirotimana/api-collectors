import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectorRecord } from '../entities/collector-record.entity';
import { CreateCollectorRecordDto } from './dto/create-collector-record.dto';
import { UpdateCollectorRecordDto } from './dto/update-collector-record.dto';

@Injectable()
export class CollectorRecordsService {
  constructor(
    @InjectRepository(CollectorRecord)
    private collectorRecordRepository: Repository<CollectorRecord>,
  ) {}

  async create(createCollectorRecordDto: CreateCollectorRecordDto): Promise<CollectorRecord> {
    const record = this.collectorRecordRepository.create(createCollectorRecordDto);
    return await this.collectorRecordRepository.save(record);
  }

  async findAll(): Promise<CollectorRecord[]> {
    return await this.collectorRecordRepository.find({
      relations: ['collector'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CollectorRecord> {
    const record = await this.collectorRecordRepository.findOne({
      where: { id },
      relations: ['collector'],
    });

    if (!record) {
      throw new NotFoundException(`Collector record with ID ${id} not found`);
    }

    return record;
  }

  async findByCalimacoId(calimacoId: string): Promise<CollectorRecord[]> {
    const records = await this.collectorRecordRepository.find({
      where: { calimacoId },
      relations: ['collector'],
      order: { recordDate: 'DESC' },
    });

    if (!records.length) {
      throw new NotFoundException(`Collector records with calimacoId ${calimacoId} not found`);
    }

    return records;
  }

  async update(id: number, updateCollectorRecordDto: UpdateCollectorRecordDto): Promise<CollectorRecord> {
    const record = await this.findOne(id);
    Object.assign(record, updateCollectorRecordDto);
    return await this.collectorRecordRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
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
    page: number = 1,
    limit: number = 50,
    collectorId?: number,
    fromDate?: string,
    toDate?: string,
  ) {
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
    page: number = 1,
    limit: number = 50,
    providerStatus?: string,
  ) {
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