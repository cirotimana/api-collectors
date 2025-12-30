import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ReconciliationDiscrepancy } from '../entities/reconciliation-discrepancies.entity';
import { ReconciliationDiscrepanciesRepository } from '../repository/reconciliation-discrepancies.repository';

@Injectable()
export class ReconciliationDiscrepanciesService {
  private readonly logger = new Logger(ReconciliationDiscrepanciesService.name);

  constructor(
    private reconciliationDiscrepanciesRepository: ReconciliationDiscrepanciesRepository,
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
      const discrepancies = await this.reconciliationDiscrepanciesRepository.findAll();
      return this.loadDynamicRelations(discrepancies);
    } catch (error) {
      this.logger.error('Error finding all discrepancies', error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<ReconciliationDiscrepancy> {
    const discrepancy = await this.reconciliationDiscrepanciesRepository.findOne(id);
    if (!discrepancy) {
      throw new NotFoundException(`Discrepancy with ID ${id} not found`);
    }
    return this.loadDynamicRelations([discrepancy])[0];
  }

  async updateStatus(id: number, status: string): Promise<ReconciliationDiscrepancy> {
    const discrepancy = await this.reconciliationDiscrepanciesRepository.findOneWithoutRelations(id);
    if (!discrepancy) {
      throw new NotFoundException(`Discrepancy with ID ${id} not found`);
    }

    discrepancy.status = status;
    await this.reconciliationDiscrepanciesRepository.save(discrepancy);
    
    return await this.findOne(id);
  }

  async updateStatusSimple(id: number, status: string): Promise<ReconciliationDiscrepancy> {
    await this.reconciliationDiscrepanciesRepository.updateStatus(id, status);
    return await this.findOne(id);
  }

  async findByStatus(status: string) {
    const discrepancies = await this.reconciliationDiscrepanciesRepository.findByStatus(status);
    return this.loadDynamicRelations(discrepancies);
  }

  async remove(id: number) {
    try {
      await this.reconciliationDiscrepanciesRepository.remove(id);
      return { message: `Discrepancy ${id} eliminada correctamente` };
    } catch (error) {
      throw new NotFoundException(`Discrepancy ${id} no encontrada`);
    }
  }
}
