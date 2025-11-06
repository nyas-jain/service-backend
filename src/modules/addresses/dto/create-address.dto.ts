import { IsString, IsOptional, IsNumber, IsLatitude, IsLongitude } from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  receiver_name?: string;

  @IsOptional()
  @IsString()
  receiver_contact?: string;

  @IsString()
  full_address: string;

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
}
