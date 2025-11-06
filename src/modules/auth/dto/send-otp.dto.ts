import { IsString, IsPhoneNumber, Length } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @Length(2, 3)
  country_code: string; // 'TH', 'IN', 'US'

  @IsString()
  @Length(10, 15)
  phone_number: string; // Without country code
}
