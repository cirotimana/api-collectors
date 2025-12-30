import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CollectorsService } from './service/collectors.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Collectors')
@ApiBearerAuth()
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
