export interface LaravelResponse<T = unknown> {
  response_code?: string;
  message?: string;
  content?: T;
  errors?: unknown;
}

export interface Paginated<T> {
  current_page?: number;
  data?: T[];
  first_page_url?: string;
  from?: number;
  last_page?: number;
  last_page_url?: string;
  next_page_url?: string | null;
  path?: string;
  per_page?: number | string;
  prev_page_url?: string | null;
  to?: number;
  total?: number;
}

export interface DefaultLocation {
  default?: { lat?: number; lon?: number };
  location?: { lat?: number; lon?: number };
}

export interface ProMemberConfig {
  enabled?: number;
  purchase_enabled?: number;
  is_pro_member?: number;
  membership?: unknown;
  benefits?: {
    discount?: { enabled?: number; percent?: number; max_amount?: number; min_order?: number };
    coupon?: { enabled?: number };
    service_fee?: { enabled?: number };
  };
  default_service_fee?: number;
  allow_renewal?: number;
  allow_cancellation?: number;
  trial_enabled?: number;
  grace_period_days?: number;
  currency_code?: string;
  currency_symbol?: string;
}

export interface AppConfig {
  business_name?: string;
  logo?: string;
  country_code?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  base_url?: string;
  currency_decimal_point?: number | string;
  currency_code?: string;
  currency_symbol?: string;
  currency_symbol_position?: string;
  about_us?: string;
  privacy_policy?: string;
  terms_and_conditions?: string;
  refund_policy?: string;
  cancellation_policy?: string;
  default_location?: DefaultLocation;
  map_api_key?: {
    is_active?: number;
    live_values?: { map_api_key_client?: string; map_api_key_server?: string };
    test_values?: { map_api_key_client?: string };
  };
  image_base_url?: string;
  pagination_limit?: number;
  payment_gateways?: string[];
  footer_text?: string;
  cookies_text?: string;
  google_social_login?: number;
  facebook_social_login?: number;
  phone_number_visibility_for_chatting?: number;
  wallet_status?: number;
  loyalty_point_status?: number;
  referral_earning_status?: number;
  direct_provider_booking?: number;
  bidding_status?: number;
  phone_verification?: number;
  email_verification?: number;
  forget_password_verification_method?: string;
  cash_after_service?: number;
  digital_payment?: number;
  wallet_payment?: number;
  customer_self_registration?: number;
  customer_can_cancel_booking?: number;
  maintenance?: { status?: number };
  maintenance_mode?: number;
  otp_resend_time?: number;
  default_commission?: string;
  blog_section_enabled?: number;
  razorpay_key?: string;
  razorpayKey?: string;
  razorpay_secret?: string;
  pro_member?: ProMemberConfig;
  app_url_playstore?: string;
  app_url_appstore?: string;
  min_versions?: { min_version_for_android?: string; min_version_for_ios?: string };
  pages?: CmsPages;
}

export interface CmsPage {
  id?: string;
  slug?: string;
  title?: string;
  content?: string;
  is_active?: number;
}

export interface CmsPages {
  about_us?: CmsPage;
  terms_and_conditions?: CmsPage;
  privacy_policy?: CmsPage;
  refund_policy?: CmsPage;
  cancellation_policy?: CmsPage;
  return_policy?: CmsPage;
}

export interface Zone {
  id: string;
  name?: string;
  is_active?: number;
}

export interface PlacePrediction {
  place_id?: string;
  description?: string;
  structured_formatting?: { main_text?: string; secondary_text?: string };
}

export interface SavedLocation {
  address: string;
  lat: number;
  lng: number;
  zoneId: string;
  zoneName?: string;
}

export interface UserInfo {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
  profile_image_full_url?: string;
  wallet_balance?: number | string;
  loyalty_point?: number | string;
  refer_code?: string;
  is_phone_verified?: number;
  is_email_verified?: number;
  provider?: unknown;
}

export interface Category {
  id: string;
  parent_id?: string | number;
  name: string;
  image?: string;
  image_full_url?: string;
  is_active?: number;
  is_featured?: number;
  children?: Category[];
}

export interface Banner {
  id: string;
  banner_title?: string;
  description?: string;
  resource_type?: string;
  resource_id?: string;
  redirect_link?: string | null;
  banner_image?: string;
  banner_image_full_url?: string;
  service?: Service;
}

export interface Campaign {
  id: string;
  title?: string;
  thumbnail?: string;
  cover_image?: string;
  image?: string;
}

export interface ServiceVariation {
  id?: number | string;
  variant?: string;
  variant_key?: string;
  variant_name?: string;
  price?: number;
  display_price?: string;
  zone_id?: string;
}

export interface Service {
  id: string;
  name: string;
  added_by?: string;
  is_featured?: string | number;
  availability?: string;
  short_description?: string | null;
  description?: string | null;
  cover_image?: string;
  thumbnail?: string;
  cover_image_full_url?: string;
  thumbnail_full_url?: string;
  thumbnails?: string;
  display_price?: string;
  currency_symbol?: string;
  price_unit?: string;
  min_price?: number | string;
  max_price?: number | string;
  price?: number | string;
  rent_duration?: string | null;
  category_id?: string;
  sub_category_id?: string;
  tax?: number;
  order_count?: number;
  is_active?: number;
  rating_count?: number;
  avg_rating?: number;
  location?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  contact_info?: string | null;
  distance?: number;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  variations?: ServiceVariation[];
  variations_app_format?: {
    zone_id?: string;
    default_price?: number;
    min_price?: number;
    max_price?: number;
    currency_symbol?: string;
    price_unit?: string;
    display_price?: string;
    zone_wise_variations?: ServiceVariation[];
  };
  faqs?: { id?: string; question?: string; answer?: string }[];
}

export interface CartItem {
  id?: string;
  service_id?: string;
  category_id?: string;
  sub_category_id?: string;
  variant_key?: string;
  quantity?: number;
  service_cost?: number;
  discounted_price?: number;
  campaign_discount_price?: number;
  coupon_discount_price?: number;
  total_cost?: number;
  service?: Service;
  provider?: Provider;
}

export interface Provider {
  id: string;
  company_name?: string;
  logo?: string;
  logo_full_url?: string;
  avg_rating?: number;
  rating_count?: number;
  address?: string;
}

export interface Address {
  id?: string | number;
  address_type?: string;
  contact_person_name?: string;
  contact_person_number?: string;
  address?: string;
  latitude?: string | number;
  longitude?: string | number;
  zone_id?: string;
  city?: string;
  zip_code?: string;
  is_default?: number;
}

export interface Booking {
  id: string;
  readable_id?: string | number;
  booking_status?: string;
  payment_status?: string;
  payment_method?: string;
  total_booking_amount?: number | string;
  service_schedule?: string;
  created_at?: string;
  detail?: unknown[];
  [key: string]: unknown;
}

export interface ChatChannel {
  id: string;
  updated_at?: string;
  last_message?: string;
  channel_users?: { user?: UserInfo; provider?: Provider }[];
}

export interface ChatMessage {
  id: string;
  message?: string;
  file?: string;
  created_at?: string;
  user_id?: string;
}

export interface WalletTx {
  id: string;
  credit?: number | string;
  debit?: number | string;
  balance?: number | string;
  transaction_type?: string;
  created_at?: string;
  reference?: string;
}

export interface ProPlan {
  id: string;
  name?: string;
  price?: number | string;
  duration?: number | string;
  duration_type?: string;
  description?: string;
}
