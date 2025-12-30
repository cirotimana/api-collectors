import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectorRecord } from '../entities/collector-record.entity';
import { CreateCollectorRecordDto } from '../dto/create-collector-record.dto';
import { UpdateCollectorRecordDto } from '../dto/update-collector-record.dto';
import { PAGINATION } from '../../../common/constants/constants';
import { CollectorRecordsRepository } from '../repository/collector-records.repository';

@Injectable()
export class CollectorRecordsService {
  constructor(
    private collectorRecordsRepository: CollectorRecordsRepository,
  ) {}

  async create(createCollectorRecordDto: CreateCollectorRecordDto): Promise<CollectorRecord> {
    return await this.collectorRecordsRepository.create(createCollectorRecordDto);
  }

  async findAll(): Promise<CollectorRecord[]> {
    return await this.collectorRecordsRepository.findAll();
  }

  async findOne(id: number): Promise<CollectorRecord> {
    const record = await this.collectorRecordsRepository.findOne(id);
    if (!record) {
      throw new NotFoundException(`Collector record with ID ${id} not found`);
    }
    return record;
  }

  async findByCalimacoId(calimacoIdNormalized: string): Promise<CollectorRecord[]> {
    const records = await this.collectorRecordsRepository.findByCalimacoId(calimacoIdNormalized);
    if (!records.length) {
      throw new NotFoundException(`Collector records with calimacoId ${calimacoIdNormalized} not found`);
    }
    return records;
  }

  async update(id: number, updateCollectorRecordDto: UpdateCollectorRecordDto): Promise<CollectorRecord> {
    return await this.collectorRecordsRepository.update(id, updateCollectorRecordDto);
  }

  async remove(id: number): Promise<void> {
    await this.collectorRecordsRepository.remove(id);
  }

  async findByCollector(collectorId: number): Promise<CollectorRecord[]> {
    return await this.collectorRecordsRepository.findByCollector(collectorId);
  }

  async findByProviderStatus(
    providerStatus: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    collectorId?: number,
    fromDate?: string,
    toDate?: string,
  ) {
    return await this.collectorRecordsRepository.findByProviderStatus(
      providerStatus,
      page,
      limit,
      collectorId,
      fromDate,
      toDate,
    );
  }

  async findWithFilters(
    collectorId?: number,
    fromDate?: string,
    toDate?: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    providerStatus?: string,
  ) {
    return await this.collectorRecordsRepository.findWithFilters(
      collectorId,
      fromDate,
      toDate,
      page,
      limit,
      providerStatus,
    );
  }
}
