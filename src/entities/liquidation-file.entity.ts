import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Liquidation } from './liquidation.entity';
import { User } from './user.entity';

@Entity('liquidation_files')
export class LiquidationFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'liquidation_id' })
  liquidationId: number;

  @Column({ name: 'liquidation_files_type', type: 'int' })
  liquidationFilesType: number;

  @Column({ name: 'file_path', type: 'text' })
  filePath: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdById: number;

  // Relaciones
  @ManyToOne(() => Liquidation, (liquidation) => liquidation.files)
  @JoinColumn({ name: 'liquidation_id' })
  liquidation: Liquidation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}