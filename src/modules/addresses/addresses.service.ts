import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddress } from '../../database/entities/user-address.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(
    @InjectRepository(UserAddress)
    private readonly addressRepository: Repository<UserAddress>,
  ) {}

  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    try {
      return await this.addressRepository.find({
        where: { user_id: userId, is_active: true },
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching addresses for user ${userId}`, error);
      throw new BadRequestException('Failed to fetch addresses');
    }
  }

  /**
   * Create new address
   */
  async createAddress(userId: string, createDto: CreateAddressDto): Promise<UserAddress> {
    try {
      const address = this.addressRepository.create({
        user_id: userId,
        ...createDto,
      });

      return await this.addressRepository.save(address);
    } catch (error) {
      this.logger.error(`Error creating address for user ${userId}`, error);
      throw new BadRequestException('Failed to create address');
    }
  }

  /**
   * Update address
   */
  async updateAddress(userId: string, addressId: string, updateDto: CreateAddressDto): Promise<UserAddress> {
    try {
      const address = await this.addressRepository.findOne({
        where: { id: addressId, user_id: userId },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      Object.assign(address, updateDto);
      return await this.addressRepository.save(address);
    } catch (error) {
      this.logger.error(`Error updating address ${addressId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update address');
    }
  }

  /**
   * Delete address (soft delete)
   */
  async deleteAddress(userId: string, addressId: string): Promise<{ message: string }> {
    try {
      const address = await this.addressRepository.findOne({
        where: { id: addressId, user_id: userId },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      address.is_active = false;
      await this.addressRepository.save(address);

      return { message: 'Address deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting address ${addressId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete address');
    }
  }

  /**
   * Get single address by ID
   */
  async getAddressById(userId: string, addressId: string): Promise<UserAddress> {
    try {
      const address = await this.addressRepository.findOne({
        where: { id: addressId, user_id: userId, is_active: true },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      return address;
    } catch (error) {
      this.logger.error(`Error fetching address ${addressId}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch address');
    }
  }
}
