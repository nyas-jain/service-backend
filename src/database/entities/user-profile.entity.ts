import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gender?: string; // 'male', 'female', 'other'

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  profile_photo?: string; // URL to S3

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string; // ISO 639-1 code

  @Column({ type: 'varchar', length: 4, unique: true, nullable: true })
  identification_pin?: string; // 4-digit PIN for delivery agents

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
