import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReconciliationDiscrepancy } from '../../entities/reconciliation-discrepancies.entity';

@Injectable()
export class ReconciliationDiscrepanciesService {
  private readonly logger = new Logger(ReconciliationDiscrepanciesService.name);

  constructor(
    @InjectRepository(ReconciliationDiscrepancy)
    private discrepancyRepository: Repository<ReconciliationDiscrepancy>,
  ) {}

  // Método auxiliar para cargar relaciones dinámicamente
  private loadDynamicRelations(discrepancies: ReconciliationDiscrepancy[]): ReconciliationDiscrepancy[] {
    return discrepancies.map(discrepancy => {
      if (!discrepancy) return discrepancy;
      
      // Forzar null en la relación que NO corresponde según method_process
      if (discrepancy.methodProcess?.includes('conciliation')) {
        discrepancy.liquidation = null;
      } else if (discrepancy.methodProcess?.includes('liquidation')) {
        discrepancy.conciliation = null;
      } else {
        discrepancy.liquidation = null;
        discrepancy.conciliation = null;
        this.logger.warn(`method_process ambiguo para discrepancia ${discrepancy.id}: ${discrepancy.methodProcess}`);
      }
      return discrepancy;
    });
  }

  async findAll() {
    try {
      const discrepancies = await this.discrepancyRepository.find({
        relations: ['liquidation', 'liquidation.collector', 'conciliation', 'conciliation.collector'],
        order: { createdAt: 'DESC' },
      });
      
      return this.loadDynamicRelations(discrepancies);
    } catch (error) {
      this.logger.error('Error finding all discrepancies', error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<ReconciliationDiscrepancy> {
    const discrepancy = await this.discrepancyRepository.findOne({
      where: { id },
      relations: ['liquidation', 'liquidation.collector', 'conciliation', 'conciliation.collector'],
    });

    if (!discrepancy) {
      throw new NotFoundException(`Discrepancy with ID ${id} not found`);
    }

    return this.loadDynamicRelations([discrepancy])[0];
  }

  // Método updateStatus corregido
  async updateStatus(id: number, status: string): Promise<ReconciliationDiscrepancy> {
    // Buscar directamente sin usar findOne para evitar problemas
    const discrepancy = await this.discrepancyRepository.findOne({
      where: { id }
    });

    if (!discrepancy) {
      throw new NotFoundException(`Discrepancy with ID ${id} not found`);
    }

    // Actualizar el estado
    discrepancy.status = status;
    
    // Guardar en la base de datos
    const updatedDiscrepancy = await this.discrepancyRepository.save(discrepancy);
    
    // Cargar relaciones para la respuesta
    return await this.findOne(id);
  }

  // Método alternativo más simple para updateStatus
  async updateStatusSimple(id: number, status: string): Promise<ReconciliationDiscrepancy> {
    const result = await this.discrepancyRepository.update(id, { status });
    
    if (result.affected === 0) {
      throw new NotFoundException(`Discrepancy with ID ${id} not found`);
    }
    
    return await this.findOne(id);
  }

  async findByStatus(status: string) {
    const discrepancies = await this.discrepancyRepository.find({
      where: { status },
      relations: ['liquidation', 'liquidation.collector', 'conciliation', 'conciliation.collector'],
      order: { createdAt: 'DESC' },
    });

    return this.loadDynamicRelations(discrepancies);
  }

  async remove(id: number) {
    const discrepancy = await this.discrepancyRepository.findOne({ where: { id } });
    if (!discrepancy) {
      throw new NotFoundException(`Discrepancy ${id} no encontrada`);
    }

    await this.discrepancyRepository.remove(discrepancy);
    return { message: `Discrepancy ${id} eliminada correctamente` };
  }
}
