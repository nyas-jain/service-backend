import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsEnum, MinLength, MaxLength, Min } from 'class-validator';
import { DietaryTag, SpicinessLevel } from '../../../database/entities/menu-item.entity';

export class CreateMenuItemDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsArray()
  dietary_tags: DietaryTag[];

  @IsEnum(SpicinessLevel)
  spiciness_level: SpicinessLevel;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsNumber()
  estimated_prep_time_minutes?: number;

  // Nutritional Information
  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsNumber()
  protein_grams?: number;

  @IsOptional()
  @IsNumber()
  carbs_grams?: number;

  @IsOptional()
  @IsNumber()
  fat_grams?: number;

  @IsOptional()
  @IsNumber()
  fiber_grams?: number;

  @IsOptional()
  @IsString()
  serving_size?: string;

  @IsOptional()
  @IsString()
  special_instructions?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  is_temporary?: boolean;

  @IsOptional()
  @IsString()
  availability_end_date?: string;

  @IsOptional()
  @IsBoolean()
  offers_delivery?: boolean;

  @IsOptional()
  @IsBoolean()
  offers_pickup?: boolean;
}
