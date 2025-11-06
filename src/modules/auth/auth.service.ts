import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities/user.entity';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { jwtConfig } from '../../config/jwt.config';
import { systemConfig } from '../../config/app.config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Send OTP to user's phone number
   * Creates user if doesn't exist
   */
  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    try {
      const { country_code, phone_number } = dto;

      // Validate phone number format
      if (!/^\d{10,15}$/.test(phone_number)) {
        throw new BadRequestException('Invalid phone number format');
      }

      // Check if user exists
      let user = await this.userRepository.findOne({
        where: { country_code, phone_number },
      });

      // Create user if doesn't exist
      if (!user) {
        user = this.userRepository.create({
          country_code,
          phone_number,
        });
        await this.userRepository.save(user);
      }

      // TODO: Integrate with Twilio/AWS SNS to send OTP
      // For now, generate a mock OTP and log it
      const otp = this.generateOtp();
      this.logger.warn(`OTP for ${country_code}${phone_number}: ${otp}`);

      // TODO: Store OTP in Redis with expiration
      // await this.redisService.set(
      //   `otp:${country_code}:${phone_number}`,
      //   otp,
      //   systemConfig.otpExpiryMinutes * 60,
      // );

      return {
        message: `OTP sent successfully to ${country_code}${phone_number}`,
      };
    } catch (error) {
      this.logger.error('Error sending OTP', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to send OTP');
    }
  }

  /**
   * Verify OTP and return JWT tokens
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponseDto> {
    try {
      const { country_code, phone_number, otp } = dto;

      // TODO: Verify OTP from Redis
      // const storedOtp = await this.redisService.get(
      //   `otp:${country_code}:${phone_number}`,
      // );
      // if (!storedOtp || storedOtp !== otp) {
      //   throw new UnauthorizedException('Invalid or expired OTP');
      // }

      // Temporary mock validation for development
      if (otp !== '1234') {
        throw new UnauthorizedException('Invalid OTP');
      }

      // Find user
      const user = await this.userRepository.findOne({
        where: { country_code, phone_number },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Mark phone as verified
      user.phone_verified = true;
      await this.userRepository.save(user);

      // TODO: Delete OTP from Redis
      // await this.redisService.del(`otp:${country_code}:${phone_number}`);

      // Generate tokens
      const tokens = this.generateTokens(user);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: jwtConfig.expiresIn,
        user_id: user.id,
        role: user.role,
        phone_number: user.phone_number,
      };
    } catch (error) {
      this.logger.error('Error verifying OTP', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify OTP');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: jwtConfig.refreshSecret,
      });

      const user = await this.userRepository.findOne({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = this.generateTokens(user);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: jwtConfig.expiresIn,
        user_id: user.id,
        role: user.role,
        phone_number: user.phone_number,
      };
    } catch (error) {
      this.logger.error('Error refreshing token', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, {
        secret: jwtConfig.secret,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Private helper methods

  private generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private generateTokens(user: User): {
    access_token: string;
    refresh_token: string;
  } {
    const payload = {
      sub: user.id,
      phone_number: user.phone_number,
      role: user.role,
      country_code: user.country_code,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.expiresIn,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    });

    return { access_token, refresh_token };
  }
}
