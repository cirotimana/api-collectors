import { Controller, Get, Param } from '@nestjs/common';
import { CollectorsService } from './collectors.service';

@Controller('collectors')
export class CollectorsController {
  constructor(private readonly collectorsService: CollectorsService) {}

  @Get()
  findAll() {
    return this.collectorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectorsService.findOne(+id);
  }
}