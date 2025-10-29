import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Collector } from './collector.entity';
import { User } from './user.entity';
import { LiquidationFile } from './liquidation-file.entity';

@Entity('liquidations')
export class Liquidation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'collector_id' })
  collectorId: number;

  // @Column({ name: 'liquidations_type', type: 'int' })
  // liquidationsType: number;

  @Column({ name: 'from_date', type: 'date' })
  fromDate: Date;

  @Column({ name: 'to_date', type: 'date' })
  toDate: Date;
  
  @Column({ name: 'amount_collector', type: 'decimal', precision: 10, scale: 2 })
  amountCollector: number;

  @Column({ name: 'amount_liquidation', type: 'decimal', precision: 10, scale: 2 })
  amountLiquidation: number;

  @Column({ name: 'difference_amounts', type: 'decimal', precision: 10, scale: 2 })
  differenceAmounts: number;

  // @Column({ name: 'liquidations_state', type: 'boolean' })
  // liquidationsState: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdById: number;

  // Relaciones
  @ManyToOne(() => Collector, (collector) => collector.liquidations)
  @JoinColumn({ name: 'collector_id' })
  collector: Collector;

  @ManyToOne(() => User, (user) => user.liquidations)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => LiquidationFile, (file) => file.liquidation)
  files: LiquidationFile[];
}