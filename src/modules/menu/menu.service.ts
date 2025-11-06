import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../../database/entities/menu-item.entity';
import { Restaurant } from '../../database/entities/restaurant.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  /**
   * Add menu item to restaurant
   */
  async addMenuItem(userId: string, restaurantId: string, createDto: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    try {
      // Verify restaurant ownership
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId, user_id: userId },
      });

      if (!restaurant) {
        throw new ForbiddenException('You can only add items to your own restaurant');
      }

      // Create menu item
      const menuItem = this.menuItemRepository.create({
        restaurant_id: restaurantId,
        ...createDto,
        is_available: true,
      });

      const saved = await this.menuItemRepository.save(menuItem);
      return this.formatMenuItemResponse(saved);
    } catch (error) {
      this.logger.error(`Error adding menu item to restaurant ${restaurantId}`, error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to add menu item');
    }
  }

  /**
   * Update menu item
   */
  async updateMenuItem(
    userId: string,
    restaurantId: string,
    itemId: string,
    updateDto: Partial<CreateMenuItemDto>,
  ): Promise<MenuItemResponseDto> {
    try {
      // Verify restaurant ownership
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId, user_id: userId },
      });

      if (!restaurant) {
        throw new ForbiddenException('You can only update items in your own restaurant');
      }

      const menuItem = await this.menuItemRepository.findOne({
        where: { id: itemId, restaurant_id: restaurantId },
      });

      if (!menuItem) {
        throw new NotFoundException('Menu item not found');
      }

      Object.assign(menuItem, updateDto);
      const updated = await this.menuItemRepository.save(menuItem);

      return this.formatMenuItemResponse(updated);
    } catch (error) {
      this.logger.error(`Error updating menu item ${itemId}`, error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update menu item');
    }
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(userId: string, restaurantId: string, itemId: string): Promise<{ message: string }> {
    try {
      // Verify restaurant ownership
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId, user_id: userId },
      });

      if (!restaurant) {
        throw new ForbiddenException('You can only delete items from your own restaurant');
      }

      const result = await this.menuItemRepository.delete({
        id: itemId,
        restaurant_id: restaurantId,
      });

      if (result.affected === 0) {
        throw new NotFoundException('Menu item not found');
      }

      return { message: 'Menu item deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting menu item ${itemId}`, error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete menu item');
    }
  }

  /**
   * Get all menu items for a restaurant (public)
   */
  async getRestaurantMenu(restaurantId: string, onlyAvailable: boolean = true): Promise<MenuItemResponseDto[]> {
    try {
      const query = this.menuItemRepository.createQueryBuilder('item').where('item.restaurant_id = :restaurantId', {
        restaurantId,
      });

      if (onlyAvailable) {
        query.andWhere('item.is_available = :available', { available: true });
      }

      const items = await query.orderBy('item.category', 'ASC').addOrderBy('item.name', 'ASC').getMany();

      return items.map((item) => this.formatMenuItemResponse(item));
    } catch (error) {
      this.logger.error(`Error fetching menu for restaurant ${restaurantId}`, error);
      throw new BadRequestException('Failed to fetch menu');
    }
  }

  /**
   * Get single menu item
   */
  async getMenuItem(itemId: string): Promise<MenuItemResponseDto> {
    try {
      const item = await this.menuItemRepository.findOne({
        where: { id: itemId },
      });

      if (!item) {
        throw new NotFoundException('Menu item not found');
      }

      return this.formatMenuItemResponse(item);
    } catch (error) {
      this.logger.error(`Error fetching menu item ${itemId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch menu item');
    }
  }

  /**
   * Toggle item availability
   */
  async toggleItemAvailability(userId: string, restaurantId: string, itemId: string): Promise<MenuItemResponseDto> {
    try {
      // Verify restaurant ownership
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId, user_id: userId },
      });

      if (!restaurant) {
        throw new ForbiddenException('You can only manage items in your own restaurant');
      }

      const menuItem = await this.menuItemRepository.findOne({
        where: { id: itemId, restaurant_id: restaurantId },
      });

      if (!menuItem) {
        throw new NotFoundException('Menu item not found');
      }

      menuItem.is_available = !menuItem.is_available;
      const updated = await this.menuItemRepository.save(menuItem);

      return this.formatMenuItemResponse(updated);
    } catch (error) {
      this.logger.error(`Error toggling item availability ${itemId}`, error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to toggle item availability');
    }
  }

  /**
   * Get menu statistics for restaurant owner
   */
  async getMenuStats(userId: string, restaurantId: string): Promise<any> {
    try {
      // Verify restaurant ownership
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId, user_id: userId },
      });

      if (!restaurant) {
        throw new ForbiddenException('You can only view stats for your own restaurant');
      }

      const stats = await this.menuItemRepository
        .createQueryBuilder('item')
        .where('item.restaurant_id = :restaurantId', { restaurantId })
        .select('COUNT(*)', 'total_items')
        .addSelect('SUM(item.total_orders)', 'total_orders')
        .addSelect('COUNT(CASE WHEN item.is_available = true THEN 1 END)', 'available_items')
        .addSelect('COUNT(CASE WHEN item.is_bestseller = true THEN 1 END)', 'bestseller_items')
        .getRawOne();

      return {
        total_items: parseInt(stats.total_items || 0),
        total_orders: parseInt(stats.total_orders || 0),
        available_items: parseInt(stats.available_items || 0),
        bestseller_items: parseInt(stats.bestseller_items || 0),
      };
    } catch (error) {
      this.logger.error(`Error fetching menu stats for restaurant ${restaurantId}`, error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch menu statistics');
    }
  }

  /**
   * Search menu items by name (public)
   */
  async searchMenuItems(restaurantId: string, searchTerm: string): Promise<MenuItemResponseDto[]> {
    try {
      const items = await this.menuItemRepository
        .createQueryBuilder('item')
        .where('item.restaurant_id = :restaurantId', { restaurantId })
        .andWhere('item.is_available = :available', { available: true })
        .andWhere('(item.name ILIKE :search OR item.description ILIKE :search)', { search: `%${searchTerm}%` })
        .orderBy('item.name', 'ASC')
        .getMany();

      return items.map((item) => this.formatMenuItemResponse(item));
    } catch (error) {
      this.logger.error(`Error searching menu items in restaurant ${restaurantId}`, error);
      throw new BadRequestException('Failed to search menu items');
    }
  }

  /**
   * Get items by dietary tag
   */
  async getItemsByDietaryTag(restaurantId: string, tag: string): Promise<MenuItemResponseDto[]> {
    try {
      const items = await this.menuItemRepository
        .createQueryBuilder('item')
        .where('item.restaurant_id = :restaurantId', { restaurantId })
        .andWhere('item.is_available = :available', { available: true })
        .andWhere(':tag = ANY(item.dietary_tags)', { tag })
        .orderBy('item.name', 'ASC')
        .getMany();

      return items.map((item) => this.formatMenuItemResponse(item));
    } catch (error) {
      this.logger.error(`Error fetching items by dietary tag in restaurant ${restaurantId}`, error);
      throw new BadRequestException('Failed to fetch items by dietary tag');
    }
  }

  /**
   * Get bestseller items for restaurant
   */
  async getBestsellerItems(restaurantId: string, limit: number = 10): Promise<MenuItemResponseDto[]> {
    try {
      const items = await this.menuItemRepository
        .createQueryBuilder('item')
        .where('item.restaurant_id = :restaurantId', { restaurantId })
        .andWhere('item.is_available = :available', { available: true })
        .orderBy('item.quantity_sold', 'DESC')
        .addOrderBy('item.average_rating', 'DESC')
        .limit(limit)
        .getMany();

      return items.map((item) => this.formatMenuItemResponse(item));
    } catch (error) {
      this.logger.error(`Error fetching bestseller items for restaurant ${restaurantId}`, error);
      throw new BadRequestException('Failed to fetch bestseller items');
    }
  }

  // Private helper methods

  private formatMenuItemResponse(item: MenuItem): MenuItemResponseDto {
    return {
      id: item.id,
      restaurant_id: item.restaurant_id,
      name: item.name,
      description: item.description,
      image_url: item.image_url,
      price: item.price as any,
      dietary_tags: item.dietary_tags,
      spiciness_level: item.spiciness_level,
      is_available: item.is_available,
      estimated_prep_time_minutes: item.estimated_prep_time_minutes,
      calories: item.calories,
      protein_grams: item.protein_grams as any,
      carbs_grams: item.carbs_grams as any,
      fat_grams: item.fat_grams as any,
      fiber_grams: item.fiber_grams as any,
      serving_size: item.serving_size,
      special_instructions: item.special_instructions,
      category: item.category,
      is_temporary: item.is_temporary,
      availability_end_date: item.availability_end_date,
      is_bestseller: item.is_bestseller,
      is_new: item.is_new,
      average_rating: item.average_rating as any,
      total_ratings: item.total_ratings,
      total_orders: item.total_orders,
      quantity_sold: item.quantity_sold,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }
}
