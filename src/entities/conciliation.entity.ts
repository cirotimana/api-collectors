import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Collector } from './collector.entity';
import { User } from './user.entity';
import { ConciliationFile } from './conciliation-file.entity';

@Entity('conciliations')
export class Conciliation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'collector_id' })
  collectorId: number;

  @Column({ name: 'conciliations_type', type: 'int' })
  conciliationsType: number;

  @Column({ type: 'text' })
  period: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'amount_collector', type: 'decimal', precision: 10, scale: 2 })
  amountCollector: number;

  @Column({ name: 'difference_amounts', type: 'decimal', precision: 10, scale: 2 })
  differenceAmounts: number;

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