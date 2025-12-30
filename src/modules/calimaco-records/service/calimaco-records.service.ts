import { Injectable, NotFoundException } from '@nestjs/common';
import { CalimacoRecord } from '../entities/calimaco-record.entity';
import { CreateCalimacoRecordDto } from '../dto/create-calimaco-record.dto';
import { UpdateCalimacoRecordDto } from '../dto/update-calimaco-record.dto';
import { PAGINATION } from '../../../common/constants/constants';
import { CalimacoRecordsRepository } from '../repository/calimaco-records.repository';

@Injectable()
export class CalimacoRecordsService {
  constructor(
    private calimacoRecordsRepository: CalimacoRecordsRepository,
  ) {}

  async create(createCalimacoRecordDto: CreateCalimacoRecordDto): Promise<CalimacoRecord> {
    return await this.calimacoRecordsRepository.create(createCalimacoRecordDto);
  }

  async findAll(): Promise<CalimacoRecord[]> {
    return await this.calimacoRecordsRepository.findAll();
  }

  async findOne(id: number): Promise<CalimacoRecord> {
    const record = await this.calimacoRecordsRepository.findOne(id);
    if (!record) {
      throw new NotFoundException(`Calimaco record with ID ${id} not found`);
    }
    return record;
  }

  async findByCalimacoId(calimacoIdNormalized: string): Promise<CalimacoRecord[]> {
    const records = await this.calimacoRecordsRepository.findByCalimacoId(calimacoIdNormalized);
    if (!records.length) {
      throw new NotFoundException(`Calimaco records with calimacoId ${calimacoIdNormalized} not found`);
    }
    return records;
  }

  async update(id: number, updateCalimacoRecordDto: UpdateCalimacoRecordDto): Promise<CalimacoRecord> {
    return await this.calimacoRecordsRepository.update(id, updateCalimacoRecordDto);
  }

  async remove(id: number): Promise<void> {
    await this.calimacoRecordsRepository.remove(id);
  }

  async findByCollector(collectorId: number): Promise<CalimacoRecord[]> {
    return await this.calimacoRecordsRepository.findByCollector(collectorId);
  }

  async findByStatus(
    status: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    collectorId?: number,
    fromDate?: string,
    toDate?: string,
  ) {
    return await this.calimacoRecordsRepository.findByStatus(
      status,
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
    status?: string,
  ) {
    return await this.calimacoRecordsRepository.findWithFilters(
      collectorId,
      fromDate,
      toDate,
      page,
      limit,
      status,
    );
  }
}
