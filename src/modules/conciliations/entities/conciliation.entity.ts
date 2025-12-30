import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Collector } from '../../collectors/entities/collector.entity';
import { User } from '../../users/entities/user.entity';
import { ConciliationFile } from './conciliation-file.entity';

@Entity('conciliations')
export class Conciliation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'collector_id' })
  collectorId: number;

  @Column({ name: 'conciliations_type', type: 'int' })
  conciliationsType: number;

  @Column({ name: 'from_date', type: 'date' })
  fromDate: Date;

  @Column({ name: 'to_date', type: 'date' })
  toDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'amount_collector', type: 'decimal', precision: 10, scale: 2 })
  amountCollector: number;

  @Column({ name: 'difference_amounts', type: 'decimal', precision: 10, scale: 2 })
  differenceAmounts: number;

  @Column({ name: 'records_calimaco', type: 'int' })
  recordsCalimaco: number;

  @Column({ name: 'records_collector', type: 'int' })
  recordsCollector: number;

  @Column({ name: 'unreconciled_records_calimaco', type: 'int' })
  unreconciledRecordsCalimaco: number;

  @Column({ name: 'unreconciled_records_collector', type: 'int' })
  unreconciledRecordsCollector: number;

  @Column({ name: 'unreconciled_amount_calimaco', type: 'decimal', precision: 10, scale: 2 })
  unreconciledAmountCalimaco: number;

  @Column({ name: 'unreconciled_amount_collector', type: 'decimal', precision: 10, scale: 2 })
  unreconciledAmountCollector: number;

  @Column({ name: 'conciliations_state', type: 'boolean' })
  conciliationsState: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdById: number;

  // Relaciones
  @ManyToOne(() => Collector, (collector) => collector.conciliations)
  @JoinColumn({ name: 'collector_id' })
  collector: Collector;

  @ManyToOne(() => User, (user) => user.conciliations)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => ConciliationFile, (file) => file.conciliation)
  files: ConciliationFile[];
}

