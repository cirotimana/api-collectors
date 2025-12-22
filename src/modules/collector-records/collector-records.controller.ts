import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CollectorRecordsService } from './collector-records.service';
import { CreateCollectorRecordDto } from './dto/create-collector-record.dto';
import { UpdateCollectorRecordDto } from './dto/update-collector-record.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Collector Records')
@ApiBearerAuth()
@Controller('collector-records')
export class CollectorRecordsController {
  constructor(private readonly collectorRecordsService: CollectorRecordsService) {}

  @Post()
  create(@Body() createCollectorRecordDto: CreateCollectorRecordDto) {
    return this.collectorRecordsService.create(createCollectorRecordDto);
  }

  @Get()
  findAll() {
    return this.collectorRecordsService.findAll();
  }

  @Get('by-collector/:collectorId')
  findByCollector(@Param('collectorId') collectorId: string) {
    return this.collectorRecordsService.findByCollector(+collectorId);
  }

  @Get('by-provider-status')
  findByProviderStatus(
    @Query('providerStatus') providerStatus: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('collectorId') collectorId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.collectorRecordsService.findByProviderStatus(
      providerStatus,
      page ? +page : 1,
      limit ? +limit : 50,
      collectorId ? +collectorId : undefined,
      fromDate,
      toDate,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectorRecordsService.findOne(+id);
  }

  @Get('by-calimaco-id/:calimacoId')
  findByCalimacoId(@Param('calimacoId') calimacoId: string) {
    return this.collectorRecordsService.findByCalimacoId(calimacoId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCollectorRecordDto: UpdateCollectorRecordDto) {
    return this.collectorRecordsService.update(+id, updateCollectorRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectorRecordsService.remove(+id);
  }

  @Get('filter')
  findWithFilters(
    @Query('collectorId') collectorId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('providerStatus') providerStatus?: string,
  ) {
    return this.collectorRecordsService.findWithFilters(
      collectorId ? +collectorId : undefined,
      fromDate,
      toDate,
      page ? +page : 1,
      limit ? +limit : 50,
      providerStatus,
    );
  }
}
