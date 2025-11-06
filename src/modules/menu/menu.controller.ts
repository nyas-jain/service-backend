import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseFilters,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

@ApiTags('Menu')
@Controller('menu')
@UseFilters(HttpExceptionFilter)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // RESTAURANT OWNER ENDPOINTS

  @Post('restaurants/:restaurantId/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add menu item (restaurant owner)' })
  async addMenuItem(
    @CurrentUser('id') userId: string,
    @Param('restaurantId') restaurantId: string,
    @Body() createDto: CreateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    return this.menuService.addMenuItem(userId, restaurantId, createDto);
  }

  @Put('restaurants/:restaurantId/items/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item (restaurant owner)' })
  async updateMenuItem(
    @CurrentUser('id') userId: string,
    @Param('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: Partial<CreateMenuItemDto>,
  ): Promise<MenuItemResponseDto> {
    return this.menuService.updateMenuItem(userId, restaurantId, itemId, updateDto);
  }

  @Delete('restaurants/:restaurantId/items/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete menu item (restaurant owner)' })
  async deleteMenuItem(
    @CurrentUser('id') userId: string,
    @Param('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
  ): Promise<{ message: string }> {
    return this.menuService.deleteMenuItem(userId, restaurantId, itemId);
  }

  @Put('restaurants/:restaurantId/items/:itemId/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle item availability (restaurant owner)' })
  async toggleItemAvailability(
    @CurrentUser('id') userId: string,
    @Param('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
  ): Promise<MenuItemResponseDto> {
    return this.menuService.toggleItemAvailability(userId, restaurantId, itemId);
  }

  @Get('restaurants/:restaurantId/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get menu statistics (restaurant owner)' })
  async getMenuStats(
    @CurrentUser('id') userId: string,
    @Param('restaurantId') restaurantId: string,
  ): Promise<any> {
    return this.menuService.getMenuStats(userId, restaurantId);
  }

  // PUBLIC ENDPOINTS

  @Get('restaurants/:restaurantId')
  @ApiOperation({ summary: 'Get restaurant menu (public)' })
  @ApiQuery({ name: 'onlyAvailable', required: false, type: Boolean })
  async getRestaurantMenu(
    @Param('restaurantId') restaurantId: string,
    @Query('onlyAvailable') onlyAvailable: boolean = true,
  ): Promise<MenuItemResponseDto[]> {
    return this.menuService.getRestaurantMenu(restaurantId, onlyAvailable);
  }

  @Get('items/:itemId')
  @ApiOperation({ summary: 'Get menu item by ID (public)' })
  async getMenuItem(@Param('itemId') itemId: string): Promise<MenuItemResponseDto> {
    return this.menuService.getMenuItem(itemId);
  }

  @Get('restaurants/:restaurantId/search')
  @ApiOperation({ summary: 'Search menu items (public)' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  async searchMenuItems(
    @Param('restaurantId') restaurantId: string,
    @Query('q') searchTerm: string,
  ): Promise<MenuItemResponseDto[]> {
    return this.menuService.searchMenuItems(restaurantId, searchTerm);
  }

  @Get('restaurants/:restaurantId/dietary/:tag')
  @ApiOperation({ summary: 'Get items by dietary tag (public)' })
  async getItemsByDietaryTag(
    @Param('restaurantId') restaurantId: string,
    @Param('tag') tag: string,
  ): Promise<MenuItemResponseDto[]> {
    return this.menuService.getItemsByDietaryTag(restaurantId, tag);
  }

  @Get('restaurants/:restaurantId/bestsellers')
  @ApiOperation({ summary: 'Get bestseller items (public)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getBestsellerItems(
    @Param('restaurantId') restaurantId: string,
    @Query('limit') limit: number = 10,
  ): Promise<MenuItemResponseDto[]> {
    return this.menuService.getBestsellerItems(restaurantId, limit);
  }
}
