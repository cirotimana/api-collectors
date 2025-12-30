import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CalimacoRecordsService } from './service/calimaco-records.service';
import { CreateCalimacoRecordDto } from './dto/create-calimaco-record.dto';
import { UpdateCalimacoRecordDto } from './dto/update-calimaco-record.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Calimaco Records')
@ApiBearerAuth()
@Controller('calimaco-records')
export class CalimacoRecordsController {
  constructor(private readonly calimacoRecordsService: CalimacoRecordsService) {}

  @Post()
  create(@Body() createCalimacoRecordDto: CreateCalimacoRecordDto) {
    return this.calimacoRecordsService.create(createCalimacoRecordDto);
  }

  @Get()
  findAll() {
    return this.calimacoRecordsService.findAll();
  }

  @Get('by-collector/:collectorId')
  findByCollector(@Param('collectorId') collectorId: string) {
    return this.calimacoRecordsService.findByCollector(+collectorId);
  }

  @Get('by-status')
  findByStatus(
    @Query('status') status: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('collectorId') collectorId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.calimacoRecordsService.findByStatus(
      status,
      page ? +page : 1,
      limit ? +limit : 50,
      collectorId ? +collectorId : undefined,
      fromDate,
      toDate,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calimacoRecordsService.findOne(+id);
  }

  @Get('by-calimaco-id/:calimacoId')
  findByCalimacoId(@Param('calimacoId') calimacoId: string) {
    return this.calimacoRecordsService.findByCalimacoId(calimacoId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCalimacoRecordDto: UpdateCalimacoRecordDto) {
    return this.calimacoRecordsService.update(+id, updateCalimacoRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calimacoRecordsService.remove(+id);
  }

  @Get('filter')
  findWithFilters(
    @Query('collectorId') collectorId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.calimacoRecordsService.findWithFilters(
      collectorId ? +collectorId : undefined,
      fromDate,
      toDate,
      page ? +page : 1,
      limit ? +limit : 50,
      status,
    );
  }
}
