import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

export enum DietaryTag {
  PURE_VEG = 'pure_veg',
  VEGAN = 'vegan',
  JAIN = 'jain',
  GLUTEN_FREE = 'gluten_free',
  ORGANIC = 'organic',
  HALAL = 'halal',
}

export enum SpicinessLevel {
  MILD = 'mild',
  MEDIUM = 'medium',
  HOT = 'hot',
  VERY_HOT = 'very_hot',
  NOT_SPICY = 'not_spicy',
}

@Entity('menu_items')
@Index(['restaurant_id'])
@Index(['is_available'])
@Index(['created_at'])
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url?: string; // URL to S3

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'simple-array', default: DietaryTag.PURE_VEG })
  dietary_tags: DietaryTag[]; // ['pure_veg', 'vegan', 'jain', etc]

  @Column({
    type: 'varchar',
    length: 50,
    default: SpicinessLevel.MEDIUM,
  })
  spiciness_level: SpicinessLevel;

  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @Column({ type: 'int', default: 20 })
  estimated_prep_time_minutes: number;

  // Nutritional Information (Required for AI recommendations)
  @Column({ type: 'int', nullable: true })
  calories?: number; // Per serving

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  protein_grams?: number; // Protein in grams

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  carbs_grams?: number; // Carbohydrates in grams

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  fat_grams?: number; // Fat in grams

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  fiber_grams?: number; // Dietary fiber

  @Column({ type: 'varchar', length: 100, nullable: true })
  serving_size?: string; // e.g., "per 100g", "per plate"

  // Item Management
  @Column({ type: 'text', nullable: true })
  special_instructions?: string; // e.g., "Cannot be modified", "No onions"

  @Column({ type: 'int', default: 0 })
  total_orders: number; // For analytics

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  average_rating: number; // Out of 5

  @Column({ type: 'int', default: 0 })
  total_ratings: number;

  // Temporary Items
  @Column({ type: 'boolean', default: false })
  is_temporary: boolean; // For special/limited time items

  @Column({ type: 'timestamp', nullable: true })
  availability_end_date?: Date; // When temporary item expires

  @Column({ type: 'timestamp', nullable: true })
  availability_end_time?: string; // Time of day when item is no longer available

  // Category/Type
  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string; // 'appetizer', 'main_course', 'dessert', 'beverage', 'sides'

  @Column({ type: 'boolean', default: false })
  is_bestseller: boolean;

  @Column({ type: 'boolean', default: false })
  is_new: boolean;

  @Column({ type: 'int', default: 0 })
  quantity_sold: number; // Track popularity

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
