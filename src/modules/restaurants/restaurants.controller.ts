import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseFilters,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { RestaurantWorkingStatus, RestaurantStatus } from '../../database/entities/restaurant.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

@ApiTags('Restaurants')
@Controller('restaurants')
@UseFilters(HttpExceptionFilter)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new restaurant' })
  async registerRestaurant(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.registerRestaurant(userId, createDto);
  }

  @Get('my-restaurant')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user restaurant profile' })
  async getMyRestaurant(@CurrentUser('id') userId: string): Promise<RestaurantResponseDto> {
    return this.restaurantsService.getRestaurantByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID' })
  async getRestaurant(@Param('id') restaurantId: string): Promise<RestaurantResponseDto> {
    return this.restaurantsService.getRestaurantById(restaurantId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant details (owner only)' })
  async updateRestaurant(
    @CurrentUser('id') userId: string,
    @Param('id') restaurantId: string,
    @Body() updateDto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.updateRestaurant(userId, restaurantId, updateDto);
  }

  @Put(':id/working-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant working status (online/busy/offline)' })
  async updateWorkingStatus(
    @CurrentUser('id') userId: string,
    @Param('id') restaurantId: string,
    @Body('status') status: RestaurantWorkingStatus,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.updateWorkingStatus(userId, restaurantId, status);
  }

  @Get()
  @ApiOperation({ summary: 'Get all approved restaurants' })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'working_status', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getAllRestaurants(
    @Query('country') country?: string,
    @Query('working_status') working_status?: RestaurantWorkingStatus,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 50,
  ): Promise<{ data: RestaurantResponseDto[]; total: number }> {
    return this.restaurantsService.getAllRestaurants(country, undefined, working_status, skip, take);
  }

  // ADMIN ENDPOINTS

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending restaurants for approval (Admin)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getPendingRestaurants(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 50,
  ): Promise<{ data: RestaurantResponseDto[]; total: number }> {
    return this.restaurantsService.getPendingRestaurants(skip, take);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve restaurant (Admin only)' })
  async approveRestaurant(
    @CurrentUser('id') adminId: string,
    @Param('id') restaurantId: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.approveRestaurant(restaurantId, adminId);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject restaurant (Admin only)' })
  async rejectRestaurant(
    @CurrentUser('id') adminId: string,
    @Param('id') restaurantId: string,
    @Body('reason') reason: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.rejectRestaurant(restaurantId, adminId, reason);
  }

  @Post(':id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend restaurant (Admin only)' })
  async suspendRestaurant(@Param('id') restaurantId: string): Promise<RestaurantResponseDto> {
    return this.restaurantsService.suspendRestaurant(restaurantId);
  }

  @Post(':id/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate suspended restaurant (Admin only)' })
  async reactivateRestaurant(@Param('id') restaurantId: string): Promise<RestaurantResponseDto> {
    return this.restaurantsService.reactivateRestaurant(restaurantId);
  }
}
