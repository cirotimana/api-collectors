import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Conciliation } from './conciliation.entity';
import { Liquidation } from './liquidation.entity';
import { Channel } from './channel.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', type: 'text' })
  firstName: string;

  @Column({ name: 'last_name', type: 'text' })
  lastName: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ name: 'profile_image', type: 'text', nullable: true })
  profileImage: string;

  @Column({ name: 'username', type: 'text' })
  username: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'channel_id', type: 'integer', nullable: true })
  channelId: number;

  @Column({ name: 'expiration_password', type: 'timestamptz', nullable: true })
  expirationPassword: Date;

  @Column({ name: 'flag_password', type: 'boolean', default: false })
  flagPassword: boolean;

  @Column({ name: 'dark_mode', type: 'boolean', default: false })
  darkMode: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // Relaciones
  @ManyToOne(() => Channel, (channel) => channel.users, { nullable: true })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @OneToMany(() => Conciliation, (conciliation) => conciliation.createdBy)
  conciliations: Conciliation[];

  @OneToMany(() => Liquidation, (liquidation) => liquidation.createdBy)
  liquidations: Liquidation[];
}