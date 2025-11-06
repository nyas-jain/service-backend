import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Length(2, 3)
  country_code: string;

  @IsString()
  @Length(10, 15)
  phone_number: string;

  @IsString()
  @Length(4, 6)
  otp: string; // 4-6 digit OTP
}
