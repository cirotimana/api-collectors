import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalimacoRecord } from '../../entities/calimaco-record.entity';
import { CreateCalimacoRecordDto } from './dto/create-calimaco-record.dto';
import { UpdateCalimacoRecordDto } from './dto/update-calimaco-record.dto';
import { PAGINATION } from '../../common/constants/constants';

@Injectable()
export class CalimacoRecordsService {
  constructor(
    @InjectRepository(CalimacoRecord)
    private calimacoRecordRepository: Repository<CalimacoRecord>,
  ) {}

  async create(createCalimacoRecordDto: CreateCalimacoRecordDto): Promise<CalimacoRecord> {
    const record = this.calimacoRecordRepository.create(createCalimacoRecordDto);
    return await this.calimacoRecordRepository.save(record);
  }

  async findAll(): Promise<CalimacoRecord[]> {
    return await this.calimacoRecordRepository.find({
      relations: ['collector'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CalimacoRecord> {
    const record = await this.calimacoRecordRepository.findOne({
      where: { id },
      relations: ['collector'],
    });

    if (!record) {
      throw new NotFoundException(`Calimaco record with ID ${id} not found`);
    }

    return record;
  }

  async findByCalimacoId(calimacoIdNormalized: string): Promise<CalimacoRecord[]> {
    const records = await this.calimacoRecordRepository.find({
      where: { calimacoIdNormalized },
      relations: ['collector'],
      order: { recordDate: 'DESC' },
    });

    if (!records.length) {
      throw new NotFoundException(`Calimaco records with calimacoId ${calimacoIdNormalized} not found`);
    }

    return records;
  }

  async update(id: number, updateCalimacoRecordDto: UpdateCalimacoRecordDto): Promise<CalimacoRecord> {
    const record = await this.findOne(id);
    Object.assign(record, updateCalimacoRecordDto);
    return await this.calimacoRecordRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await this.calimacoRecordRepository.remove(record);
  }

  async findByCollector(collectorId: number): Promise<CalimacoRecord[]> {
    return await this.calimacoRecordRepository.find({
      where: { collectorId },
      relations: ['collector'],
      order: { recordDate: 'DESC' },
    });
  }

  async findByStatus(
    status: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    collectorId?: number,
    fromDate?: string,
    toDate?: string,
  ) {
    const queryBuilder = this.calimacoRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.collector', 'collector')
      .where('record.status = :status', { status });

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
    status?: string,
  ) {
    const queryBuilder = this.calimacoRecordRepository
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

    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      queryBuilder.andWhere('record.status IN (:...statusArray)', { statusArray });
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
