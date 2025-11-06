export class RestaurantResponseDto {
  id: string;
  name: string;
  description?: string;
  owner_name: string;
  address: string;
  city?: string;
  country: string;
  latitude: number;
  longitude: number;
  logo_url?: string;
  cover_image_url?: string;
  cuisine_types: string[];
  working_status: string;
  status: string;
  rating: number;
  total_reviews: number;
  total_orders: number;
  avg_prep_time_minutes: number;
  minimum_order_amount: number;
  offers_delivery: boolean;
  offers_pickup: boolean;
  is_vegetarian_only: boolean;
  accepts_orders: boolean;
  created_at: Date;
  updated_at: Date;
  user_id?: string;
}
