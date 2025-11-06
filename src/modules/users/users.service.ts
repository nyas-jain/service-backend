import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { UserProfile } from '../../database/entities/user-profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserStatus } from '../../common/enums/user-status.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
  ) {}

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this.formatUserResponse(user);
    } catch (error) {
      this.logger.error(`Error fetching user profile: ${userId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user profile');
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updateDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update or create profile
      if (!user.profile) {
        user.profile = this.profileRepository.create({
          user_id: userId,
        });
      }

      // Update profile fields
      if (updateDto.name) user.profile.name = updateDto.name;
      if (updateDto.gender) user.profile.gender = updateDto.gender;
      if (updateDto.dob) user.profile.dob = new Date(updateDto.dob);
      if (updateDto.email) user.profile.email = updateDto.email;
      if (updateDto.profile_photo) user.profile.profile_photo = updateDto.profile_photo;
      if (updateDto.language) user.profile.language = updateDto.language;

      // Update user email if provided
      if (updateDto.email) {
        user.email = updateDto.email;
      }

      await this.profileRepository.save(user.profile);
      await this.userRepository.save(user);

      return this.formatUserResponse(user);
    } catch (error) {
      this.logger.error(`Error updating user profile: ${userId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user profile');
    }
  }

  /**
   * Get all users with filters (Admin only)
   */
  async getAllUsers(
    role?: string,
    status?: string,
    skip: number = 0,
    take: number = 50,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    try {
      const query = this.userRepository.createQueryBuilder('user').leftJoinAndSelect('user.profile', 'profile');

      if (role) {
        query.andWhere('user.role = :role', { role });
      }

      if (status) {
        query.andWhere('user.status = :status', { status });
      }

      query.skip(skip).take(take).orderBy('user.created_at', 'DESC');

      const [users, total] = await query.getManyAndCount();

      return {
        data: users.map((user) => this.formatUserResponse(user)),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching users', error);
      throw new BadRequestException('Failed to fetch users');
    }
  }

  /**
   * Update user status (Admin only)
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['profile'] });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.status = status;
      await this.userRepository.save(user);

      return this.formatUserResponse(user);
    } catch (error) {
      this.logger.error(`Error updating user status: ${userId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user status');
    }
  }

  /**
   * Search users by phone number (Admin)
   */
  async searchUserByPhone(
    country_code: string,
    phone_number: string,
  ): Promise<UserResponseDto | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { country_code, phone_number },
        relations: ['profile'],
      });

      return user ? this.formatUserResponse(user) : null;
    } catch (error) {
      this.logger.error('Error searching user', error);
      throw new BadRequestException('Failed to search user');
    }
  }

  /**
   * Reset user account (Admin only)
   */
  async resetUserAccount(userId: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Reset sensitive fields
      user.phone_verified = false;
      await this.userRepository.save(user);

      return { message: 'User account has been reset' };
    } catch (error) {
      this.logger.error(`Error resetting user account: ${userId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to reset user account');
    }
  }

  // Private helper methods

  private formatUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      country_code: user.country_code,
      phone_number: user.phone_number,
      email: user.email,
      role: user.role,
      status: user.status,
      phone_verified: user.phone_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
      profile: user.profile
        ? {
            name: user.profile.name,
            gender: user.profile.gender,
            dob: user.profile.dob,
            email: user.profile.email,
            profile_photo: user.profile.profile_photo,
            language: user.profile.language,
          }
        : undefined,
    };
  }
}
