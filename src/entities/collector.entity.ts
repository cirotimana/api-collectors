import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Conciliation } from './conciliation.entity';
import { Liquidation } from './liquidation.entity';
import { User } from './user.entity';

@Entity('collectors')
export class Collector {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ 
    name: 'created_at', 
    type: 'timestamptz', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'integer', nullable: true })
  createdById: number;

  @Column({ 
    name: 'updated_at', 
    type: 'timestamptz', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  updatedAt: Date;

  @Column({ name: 'updated_by', type: 'integer', nullable: true })
  updatedById: number;

  // Relaciones
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @OneToMany(() => Conciliation, (conciliation) => conciliation.collector)
  conciliations: Conciliation[];

  @OneToMany(() => Liquidation, (liquidation) => liquidation.collector)
  liquidations: Liquidation[];
}