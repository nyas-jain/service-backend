import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_addresses')
@Index(['user_id'])
@Index(['country', 'state', 'city'])
export class UserAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  label?: string; // 'home', 'office', 'other'

  @Column({ type: 'varchar', length: 255, nullable: true })
  receiver_name?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  receiver_contact?: string;

  @Column({ type: 'text' })
  full_address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  floor?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  landmark?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  locality?: string;

  @Column({ type: 'varchar', length: 3 })
  country: string; // 'TH', 'IN', 'US'

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
