import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Collector } from '../../collectors/entities/collector.entity';

@Entity('collector_records')
@Unique('unique_collector_id_calimaco_status', ['collectorId', 'calimacoId', 'providerStatus'])
@Index('idx_collector_record_date', ['recordDate'])
@Index('idx_collector_amount', ['amount'])
@Index('idx_collector_id_calimaco_status', ['collectorId', 'calimacoId', 'providerStatus'])
@Index('idx_collector_normalized', ['collectorId', 'calimacoIdNormalized'])
@Index('idx_collector_normalized_id', ['calimacoIdNormalized'])
@Index('idx_collector_join', ['collectorId', 'calimacoIdNormalized', 'amount'])
@Index('idx_collector_filter', ['collectorId', 'recordDate'])
export class CollectorRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'collector_id' })
  collectorId: number;

  @Column({ name: 'record_date', type: 'timestamp' })
  recordDate: Date;

  @Column({ name: 'calimaco_id', type: 'varchar', length: 50 })
  calimacoId: string;

  @Column({ name: 'calimaco_id_normalized', type: 'varchar', length: 50, nullable: true })
  calimacoIdNormalized: string;

  @Column({ name: 'provider_id', type: 'varchar', length: 100, nullable: true })
  providerId: string;

  @Column({ name: 'client_name', type: 'varchar', length: 255, nullable: true })
  clientName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'provider_status', type: 'varchar', length: 50 })
  providerStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Collector)
  @JoinColumn({ name: 'collector_id' })
  collector: Collector;
}

