import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { RestaurantWorkingStatus } from '../../../database/entities/restaurant.entity';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @IsOptional()
  @IsEnum(RestaurantWorkingStatus)
  working_status?: RestaurantWorkingStatus;
}
