import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Collector } from './collector.entity';

@Entity('calimaco_records')
@Unique('unique_calimaco_collector_id_status', ['collectorId', 'calimacoId', 'status'])
@Index('idx_calimaco_record_date', ['recordDate'])
@Index('idx_calimaco_amount', ['amount'])
@Index('idx_calimaco_collector_id_status', ['collectorId', 'calimacoId', 'status'])
@Index('idx_calimaco_normalized', ['collectorId', 'calimacoIdNormalized'])
@Index('idx_calimaco_normalized_id', ['calimacoIdNormalized'])
@Index('idx_calimaco_join', ['collectorId', 'calimacoIdNormalized', 'amount'])
@Index('idx_calimaco_filter', ['collectorId', 'recordDate'])
export class CalimacoRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'collector_id' })
  collectorId: number;

  @Column({ name: 'calimaco_id', type: 'varchar', length: 50 })
  calimacoId: string;

  @Column({ name: 'calimaco_id_normalized', type: 'varchar', length: 50, nullable: true })
  calimacoIdNormalized: string;

  @Column({ name: 'record_date', type: 'timestamp' })
  recordDate: Date;

  @Column({ name: 'modification_date', type: 'timestamp', nullable: true })
  modificationDate: Date;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ name: 'user_id', type: 'varchar', length: 50, nullable: true })
  userId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'external_id', type: 'varchar', length: 100, nullable: true })
  externalId: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Collector)
  @JoinColumn({ name: 'collector_id' })
  collector: Collector;
}