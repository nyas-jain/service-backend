import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum RestaurantStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum RestaurantWorkingStatus {
  ONLINE = 'online',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

@Entity('restaurants')
@Index(['user_id'], { unique: true })
@Index(['status'])
@Index(['working_status'])
@Index(['country'])
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string; // FK to User (owner)

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255 })
  owner_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  owner_contact?: string;

  @Column({ type: 'text' })
  address: string;

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

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  logo_url?: string; // URL to S3

  @Column({ type: 'text', nullable: true })
  cover_image_url?: string; // URL to S3

  @Column({ type: 'simple-array', default: 'Pure Veg,Vegan' })
  cuisine_types: string[]; // ['Pure Veg', 'Jain', 'Vegan', 'Thai Veg', 'Satvik', 'Organic']

  @Column({ type: 'varchar', length: 50, default: RestaurantWorkingStatus.OFFLINE })
  working_status: RestaurantWorkingStatus; // online, busy, offline

  @Column({ type: 'varchar', length: 50, default: RestaurantStatus.PENDING_APPROVAL })
  status: RestaurantStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number; // Out of 5.00

  @Column({ type: 'int', default: 0 })
  total_reviews: number;

  @Column({ type: 'int', default: 0 })
  total_orders: number;

  @Column({ type: 'int', default: 0 })
  cancelled_orders: number;

  @Column({ type: 'boolean', default: true })
  is_vegetarian_only: boolean; // KHAO policy

  // Bank Details
  @Column({ type: 'varchar', length: 255, nullable: true })
  bank_account_holder?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bank_account_number?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  bank_ifsc_code?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank_name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  upi_id?: string;

  // Approval Details
  @Column({ type: 'uuid', nullable: true })
  approved_by?: string; // Admin user_id

  @Column({ type: 'timestamp', nullable: true })
  approved_at?: Date;

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at?: Date;

  // Opening Hours (Optional - can be extended later)
  @Column({ type: 'time', nullable: true })
  opening_time?: string;

  @Column({ type: 'time', nullable: true })
  closing_time?: string;

  @Column({ type: 'simple-array', default: '1,2,3,4,5,6,7' })
  open_days: number[]; // 1=Mon, 2=Tue, ... 7=Sun

  @Column({ type: 'boolean', default: true })
  accepts_orders: boolean;

  @Column({ type: 'int', default: 30 })
  avg_prep_time_minutes: number; // Estimated average prep time

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimum_order_amount: number;

  @Column({ type: 'boolean', default: false })
  offers_delivery: boolean;

  @Column({ type: 'boolean', default: false })
  offers_pickup: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_order_at?: Date; // For activity tracking

  // Relations
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
