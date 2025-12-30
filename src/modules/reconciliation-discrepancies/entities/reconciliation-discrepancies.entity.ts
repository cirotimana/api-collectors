import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Liquidation } from '../../liquidations/entities/liquidation.entity';
import { Conciliation } from '../../conciliations/entities/conciliation.entity';
import { Collector } from '../../collectors/entities/collector.entity';

@Entity('reconciliation_discrepancies')
export class ReconciliationDiscrepancy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_report' })
  idReport: number;

  @Column({ type: 'varchar', length: 50, default: 'new' })
  status: string;

  @Column({ name: 'difference', type: 'decimal', precision: 10, scale: 2 })
  difference: number;
 
  @Column({ name: 'method_process', type: 'varchar', length: 50 })
  methodProcess: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAT: Date;

  // Relaciones - puede ser con Liquidation O Conciliation
  @ManyToOne(() => Liquidation, (liquidation) => liquidation, { nullable: true })
  @JoinColumn({ name: 'id_report', referencedColumnName: 'id' })
  liquidation: Liquidation | null;

  @ManyToOne(() => Conciliation, (conciliation) => conciliation, { nullable: true })
  @JoinColumn({ name: 'id_report', referencedColumnName: 'id' })
  conciliation: Conciliation | null;


}

