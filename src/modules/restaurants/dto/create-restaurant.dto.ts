import { IsString, IsEmail, IsOptional, IsArray, IsNumber, IsLatitude, IsLongitude, MinLength, MaxLength } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(3)
  owner_name: string;

  @IsOptional()
  @IsString()
  owner_contact?: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsArray()
  cuisine_types: string[];

  @IsOptional()
  @IsString()
  bank_account_holder?: string;

  @IsOptional()
  @IsString()
  bank_account_number?: string;

  @IsOptional()
  @IsString()
  bank_ifsc_code?: string;

  @IsOptional()
  @IsString()
  bank_name?: string;

  @IsOptional()
  @IsString()
  upi_id?: string;

  @IsOptional()
  @IsString()
  opening_time?: string;

  @IsOptional()
  @IsString()
  closing_time?: string;

  @IsOptional()
  @IsArray()
  open_days?: number[];

  @IsOptional()
  @IsNumber()
  avg_prep_time_minutes?: number;

  @IsOptional()
  @IsNumber()
  minimum_order_amount?: number;

  @IsOptional()
  offers_delivery?: boolean;

  @IsOptional()
  offers_pickup?: boolean;
}
