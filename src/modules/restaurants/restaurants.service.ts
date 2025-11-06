import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant, RestaurantStatus, RestaurantWorkingStatus } from '../../database/entities/restaurant.entity';
import { User } from '../../database/entities/user.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);

  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Register a new restaurant
   */
  async registerRestaurant(userId: string, createDto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    try {
      // Check if user exists and is a restaurant
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if restaurant already exists for this user
      const existingRestaurant = await this.restaurantRepository.findOne({ where: { user_id: userId } });
      if (existingRestaurant) {
        throw new ConflictException('Restaurant already registered for this user');
      }

      // Create restaurant with pending approval status
      const restaurant = this.restaurantRepository.create({
        user_id: userId,
        ...createDto,
        status: RestaurantStatus.PENDING_APPROVAL,
        working_status: RestaurantWorkingStatus.OFFLINE,
      });

      const saved = await this.restaurantRepository.save(restaurant);

      // Update user role to restaurant
      user.role = UserRole.RESTAURANT;
      await this.userRepository.save(user);

      return this.formatRestaurantResponse(saved);
    } catch (error) {
      this.logger.error(`Error registering restaurant for user ${userId}`, error);
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to register restaurant');
    }
  }

  /**
   * Get restaurant profile by user ID
   */
  async getRestaurantByUserId(userId: string): Promise<RestaurantResponseDto> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { user_id: userId },
        relations: ['user'],
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      return this.formatRestaurantResponse(restaurant);
    } catch (error) {
      this.logger.error(`Error fetching restaurant for user ${userId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch restaurant');
    }
  }

  /**
   * Get restaurant by ID
   */
  async getRestaurantById(restaurantId: string): Promise<RestaurantResponseDto> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['user'],
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      return this.formatRestaurantResponse(restaurant);
    } catch (error) {
      this.logger.error(`Error fetching restaurant ${restaurantId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch restaurant');
    }
  }

  /**
   * Update restaurant details (owner only, except phone and country)
   */
  async updateRestaurant(
    userId: string,
    restaurantId: string,
    updateDto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      // Check if user owns this restaurant
      if (restaurant.user_id !== userId) {
        throw new ForbiddenException('You can only update your own restaurant');
      }

      // Don't allow updating country
      if (updateDto.country) {
        delete updateDto.country;
      }

      Object.assign(restaurant, updateDto);
      const updated = await this.restaurantRepository.save(restaurant);

      return this.formatRestaurantResponse(updated);
    } catch (error) {
      this.logger.error(`Error updating restaurant ${restaurantId}`, error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to update restaurant');
    }
  }

  /**
   * Update restaurant working status (online/busy/offline)
   */
  async updateWorkingStatus(
    userId: string,
    restaurantId: string,
    status: RestaurantWorkingStatus,
  ): Promise<RestaurantResponseDto> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      if (restaurant.user_id !== userId) {
        throw new ForbiddenException('You can only update your own restaurant');
      }

      restaurant.working_status = status;
      if (status === RestaurantWorkingStatus.ONLINE) {
        restaurant.last_order_at = new Date();
      }
      const updated = await this.restaurantRepository.save(restaurant);

      return this.formatRestaurantResponse(updated);
    } catch (error) {
      this.logger.error(`Error updating working status for restaurant ${restaurantId}`, error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to update working status');
    }
  }

  /**
   * Get all restaurants with filters (Admin/Customer)
   */
  async getAllRestaurants(
    country?: string,
    status?: RestaurantStatus,
    working_status?: RestaurantWorkingStatus,
    skip: number = 0,
    take: number = 50,
  ): Promise<{ data: RestaurantResponseDto[]; total: number }> {
    try {
      const query = this.restaurantRepository.createQueryBuilder('restaurant');

      // Only show approved restaurants to customers
      query.andWhere('restaurant.status = :status', { status: RestaurantStatus.APPROVED });

      if (country) {
        query.andWhere('restaurant.country = :country', { country });
      }

      if (working_status) {
        query.andWhere('restaurant.working_status = :working_status', { working_status });
      }

      query.skip(skip).take(take).orderBy('restaurant.rating', 'DESC');

      const [restaurants, total] = await query.getManyAndCount();

      return {
        data: restaurants.map((r) => this.formatRestaurantResponse(r)),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching restaurants', error);
      throw new BadRequestException('Failed to fetch restaurants');
    }
  }

  /**
   * Get pending restaurants for admin approval
   */
  async getPendingRestaurants(skip: number = 0, take: number = 50): Promise<{ data: RestaurantResponseDto[]; total: number }> {
    try {
      const [restaurants, total] = await this.restaurantRepository.findAndCount({
        where: { status: RestaurantStatus.PENDING_APPROVAL },
        order: { created_at: 'ASC' },
        skip,
        take,
        relations: ['user'],
      });

      return {
        data: restaurants.map((r) => this.formatRestaurantResponse(r)),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching pending restaurants', error);
      throw new BadRequestException('Failed to fetch pending restaurants');
    }
  }

  /**
   * Approve restaurant (Admin only)
   */
  async approveRestaurant(restaurantId: string, adminId: string): Promise<RestaurantResponseDto> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      restaurant.status = RestaurantStatus.APPROVED;
      restaurant.approved_by = adminId;
      restaurant.approved_at = new Date();
      restaurant.rejection_reason = undefined;
      restaurant.rejected_at = undefined;

      const updated = await this.restaurantRepository.save(restaurant);
      return this.formatRestaurantResponse(updated);
    } catch (error) {
      this.logger.error(`Error approving restaurant ${restaurantId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to approve restaurant');
    }
  }

  /**
   * Reject restaurant (Admin only)
   */
  async rejectRestaurant(restaurantId: string, adminId: string, reason: string): Promise<RestaurantResponseDto> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      restaurant.status = RestaurantStatus.REJECTED;
      restaurant.rejection_reason = reason;
      restaurant.rejected_at = new Date();

      const updated = await this.restaurantRepository.save(restaurant);
      return this.formatRestaurantResponse(updated);
    } catch (error) {
      this.logger.error(`Error rejecting restaurant ${restaurantId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to reject restaurant');
    }
  }

  /**
   * Suspend restaurant (Admin only)
   */
  async suspendRestaurant(restaurantId: string): Promise<RestaurantResponseDto> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      restaurant.status = RestaurantStatus.SUSPENDED;
      restaurant.working_status = RestaurantWorkingStatus.OFFLINE;
      const updated = await this.restaurantRepository.save(restaurant);

      return this.formatRestaurantResponse(updated);
    } catch (error) {
      this.logger.error(`Error suspending restaurant ${restaurantId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to suspend restaurant');
    }
  }

  /**
   * Reactivate suspended restaurant (Admin only)
   */
  async reactivateRestaurant(restaurantId: string): Promise<RestaurantResponseDto> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      restaurant.status = RestaurantStatus.APPROVED;
      const updated = await this.restaurantRepository.save(restaurant);

      return this.formatRestaurantResponse(updated);
    } catch (error) {
      this.logger.error(`Error reactivating restaurant ${restaurantId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to reactivate restaurant');
    }
  }

  // Private helper methods

  private formatRestaurantResponse(restaurant: Restaurant): RestaurantResponseDto {
    return {
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      owner_name: restaurant.owner_name,
      address: restaurant.address,
      city: restaurant.city,
      country: restaurant.country,
      latitude: restaurant.latitude as any,
      longitude: restaurant.longitude as any,
      logo_url: restaurant.logo_url,
      cover_image_url: restaurant.cover_image_url,
      cuisine_types: restaurant.cuisine_types,
      working_status: restaurant.working_status,
      status: restaurant.status,
      rating: restaurant.rating as any,
      total_reviews: restaurant.total_reviews,
      total_orders: restaurant.total_orders,
      avg_prep_time_minutes: restaurant.avg_prep_time_minutes,
      minimum_order_amount: restaurant.minimum_order_amount as any,
      offers_delivery: restaurant.offers_delivery,
      offers_pickup: restaurant.offers_pickup,
      is_vegetarian_only: restaurant.is_vegetarian_only,
      accepts_orders: restaurant.accepts_orders,
      created_at: restaurant.created_at,
      updated_at: restaurant.updated_at,
    };
  }
}
