import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { UserProfile } from './user-profile.entity';
import { UserAddress } from './user-address.entity';

@Entity('users')
@Index(['phone_number', 'country_code'], { unique: true })
@Index(['status'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 3 })
  country_code: string; // e.g., 'TH', 'IN', 'US'

  @Column({ type: 'varchar', length: 20 })
  phone_number: string; // Stored without country code

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  phone_verified: boolean;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: true,
    nullable: true,
  })
  profile?: UserProfile;

  @OneToMany(() => UserAddress, (address) => address.user, {
    cascade: true,
  })
  addresses?: UserAddress[];
}
