export class AuthResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: string;
  role: string;
  phone_number: string;
}
