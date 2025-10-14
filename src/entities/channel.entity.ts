import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    name: 'created_at', 
    type: 'timestamptz', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  createdAt: Date;

  @Column({ 
    name: 'updated_at', 
    type: 'timestamptz', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  updatedAt: Date;

  @Column({ 
    name: 'deleted_at', 
    type: 'timestamptz', 
    nullable: true 
  })
  deletedAt: Date;

  // Relación con Users
  @OneToMany(() => User, (user) => user.channel)
  users: User[];
}