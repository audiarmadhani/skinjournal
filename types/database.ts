export type SkinGoal =
  | 'acne'
  | 'dark_spots'
  | 'hydration'
  | 'redness'
  | 'texture'
  | 'brightness'
  | 'oil_control'
  | 'pores';

export type RoutineType = 'morning' | 'night';

export const MIN_USAGE_INTERVAL = 1;
export const MAX_USAGE_INTERVAL = 90;

export type SubscriptionTier = 'free' | 'premium';

/** Reported sex from onboarding; drives suggestion personalization */
export type ProfileSex = 'female' | 'male' | 'prefer_not_to_say';

export interface Profile {
  id: string;
  name: string;
  email: string;
  skin_goals: SkinGoal[];
  concerns: string[];
  onboarding_completed: boolean;
  baseline_photo_id: string | null;
  subscription_tier: SubscriptionTier;
  premium_expires_at: string | null;
  created_at: string;
  /** Approximate latitude from one-time foreground location capture; null if not collected */
  location_latitude: number | null;
  location_longitude: number | null;
  /** Horizontal accuracy in meters when captured */
  location_accuracy_m: number | null;
  location_city: string | null;
  location_region: string | null;
  location_country: string | null;
  /** ISO timestamp when coordinates were saved; null means never captured */
  location_captured_at: string | null;
  /** Self-reported age in years (onboarding); null if not provided */
  age_years: number | null;
  /** Self-reported sex (onboarding); null if not provided */
  sex: ProfileSex | null;
}

export interface PhotoMetadata {
  time: string;
  lighting_quality: 'good' | 'fair' | 'poor';
  device_info: string;
}

export interface Photo {
  id: string;
  user_id: string;
  image_url: string;
  storage_path?: string;
  date: string;
  metadata: PhotoMetadata;
  analysis?: Record<string, unknown>;
  baseline: boolean;
}

export interface Product {
  id: string;
  user_id: string;
  /** Skincare step type (e.g. Cleanser, Serum) */
  name: string;
  /** Brand the user uses for this step */
  brand: string;
  routine_type: RoutineType;
  started_at: string;
  /** Use every N days from started_at (1 = daily, max 90). */
  usage_interval_days: number;
  notes?: string;
}

export interface RoutineLog {
  id: string;
  user_id: string;
  date: string;
  morning_completed: string[];
  night_completed: string[];
}

export interface Insight {
  id: string;
  photo_id: string | null;
  user_id: string;
  summary: string;
  generated_at: string;
  source: 'openai' | 'template';
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  highest_streak: number;
  last_log_date: string | null;
}

export interface ShareCard {
  id: string;
  user_id: string;
  image_url: string;
  generated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      photos: { Row: Photo; Insert: Partial<Photo>; Update: Partial<Photo> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      routine_logs: { Row: RoutineLog; Insert: Partial<RoutineLog>; Update: Partial<RoutineLog> };
      insights: { Row: Insight; Insert: Partial<Insight>; Update: Partial<Insight> };
      streaks: { Row: Streak; Insert: Partial<Streak>; Update: Partial<Streak> };
      share_cards: { Row: ShareCard; Insert: Partial<ShareCard>; Update: Partial<ShareCard> };
    };
  };
}
