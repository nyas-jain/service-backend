import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseFilters,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { UserAddress } from '../../database/entities/user-address.entity';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseFilters(HttpExceptionFilter)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for current user' })
  async getUserAddresses(@CurrentUser('id') userId: string): Promise<UserAddress[]> {
    return this.addressesService.getUserAddresses(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new address' })
  async createAddress(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateAddressDto,
  ): Promise<UserAddress> {
    return this.addressesService.createAddress(userId, createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  async getAddressById(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ): Promise<UserAddress> {
    return this.addressesService.getAddressById(userId, addressId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update address' })
  async updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() updateDto: CreateAddressDto,
  ): Promise<UserAddress> {
    return this.addressesService.updateAddress(userId, addressId, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete address' })
  async deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ): Promise<{ message: string }> {
    return this.addressesService.deleteAddress(userId, addressId);
  }
}
