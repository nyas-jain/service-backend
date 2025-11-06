import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

@ApiTags('Users')
@Controller('users')
@UseFilters(HttpExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.getUserProfile(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserProfile(userId, updateDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile by ID' })
  async getUserById(@Param('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.getUserProfile(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with filters (Admin/Support only)' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by user role' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by user status' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take' })
  async getAllUsers(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 50,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    return this.usersService.getAllUsers(role, status, skip, take);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body('status') status: UserStatus,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserStatus(userId, status);
  }

  @Put(':id/reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset user account (Admin/Support only)' })
  async resetUserAccount(@Param('id') userId: string): Promise<{ message: string }> {
    return this.usersService.resetUserAccount(userId);
  }
}
