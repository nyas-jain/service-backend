export class UserResponseDto {
  id: string;
  country_code: string;
  phone_number: string;
  email?: string;
  role: string;
  status: string;
  phone_verified: boolean;
  created_at: Date;
  updated_at: Date;
  profile?: {
    name?: string;
    gender?: string;
    dob?: Date;
    email?: string;
    profile_photo?: string;
    language: string;
  };
}
