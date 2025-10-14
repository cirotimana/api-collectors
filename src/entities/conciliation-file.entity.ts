import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Conciliation } from './conciliation.entity';
import { User } from './user.entity';

@Entity('conciliation_files')
export class ConciliationFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conciliation_id' })
  conciliationId: number;

  @Column({ name: 'conciliation_files_type', type: 'int' })
  conciliationFilesType: number;

  @Column({ name: 'file_path', type: 'text' })
  filePath: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdById: number;

  // Relaciones
  @ManyToOne(() => Conciliation, (conciliation) => conciliation.files)
  @JoinColumn({ name: 'conciliation_id' })
  conciliation: Conciliation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}