import type {
  Insight,
  Photo,
  PhotoSession,
  Product,
  Profile,
  RoutineLog,
  Streak,
} from '@/types';
import type { AppSession } from '@/types/session';
import type { PhotoSessionUploadResult, UploadPhotoSessionInput } from '@/types/photo-upload';
import { PHOTO_ANGLE_ORDER } from '@/constants/photo-angles';
import { todayISO, toLocalISODate } from '@/utils/dates';
import { getFrontPhoto } from '@/utils/photo-sessions';
import { normalizeUsageInterval, withNormalizedInterval } from '@/utils/product-schedule';
import { computeWeeklySummary } from '@/utils/weekly-summary';
import {
  MOCK_INSIGHTS,
  MOCK_PHOTOS,
  MOCK_PHOTO_SESSIONS,
  MOCK_PRODUCTS,
  MOCK_PROFILE,
  MOCK_ROUTINE_LOG,
  MOCK_SESSION,
  MOCK_STREAK,
} from './seed';

let photos = [...MOCK_PHOTOS];
let photoSessions = [...MOCK_PHOTO_SESSIONS];
let products = [...MOCK_PRODUCTS];
let insights = [...MOCK_INSIGHTS];
let routineLog = { ...MOCK_ROUTINE_LOG };
const routineLogsByDate: Record<string, RoutineLog> = {
  [MOCK_ROUTINE_LOG.date]: { ...MOCK_ROUTINE_LOG },
};
let streak = { ...MOCK_STREAK };
let profile = { ...MOCK_PROFILE };

export const mockProvider = {
  async getSession(): Promise<AppSession | null> {
    return MOCK_SESSION;
  },

  async signIn(email: string, _password: string): Promise<AppSession> {
    profile = { ...MOCK_PROFILE, email };
    return { ...MOCK_SESSION, user: { id: MOCK_SESSION.user.id, email } };
  },

  async signUp(email: string, _password: string, name: string): Promise<AppSession> {
    profile = {
      ...MOCK_PROFILE,
      email,
      name,
      onboarding_completed: false,
      subscription_tier: 'free',
      premium_expires_at: null,
    };
    return { ...MOCK_SESSION, user: { id: MOCK_SESSION.user.id, email } };
  },

  async signOut() {
    return;
  },

  async ensureProfile(): Promise<Profile> {
    return profile;
  },

  async getProfile(): Promise<Profile> {
    return profile;
  },

  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    profile = { ...profile, ...updates };
    return profile;
  },

  async getPhotos(): Promise<Photo[]> {
    return [...photos].sort((a, b) => b.date.localeCompare(a.date));
  },

  async getPhoto(id: string): Promise<Photo | null> {
    return photos.find((p) => p.id === id) ?? null;
  },

  async updatePhotoAnalysis(
    photoId: string,
    analysis: Record<string, unknown>
  ): Promise<Photo> {
    const index = photos.findIndex((p) => p.id === photoId);
    if (index === -1) throw new Error('Photo not found');
    const updated = { ...photos[index], analysis };
    photos = [...photos.slice(0, index), updated, ...photos.slice(index + 1)];
    return updated;
  },

  async deletePhoto(photoId: string): Promise<void> {
    const removed = photos.find((p) => p.id === photoId);
    if (!removed) return;

    if (removed.session_id) {
      const sessionId = removed.session_id;
      const sessionPhotos = photos.filter((p) => p.session_id === sessionId);
      const hadBaseline = sessionPhotos.some((p) => p.baseline);
      const clearedBaseline = sessionPhotos.some((p) => p.id === profile.baseline_photo_id);
      photos = photos.filter((p) => p.session_id !== sessionId);
      photoSessions = photoSessions.filter((s) => s.id !== sessionId);
      if (hadBaseline || clearedBaseline) {
        profile = { ...profile, baseline_photo_id: null };
      }
      return;
    }

    photos = photos.filter((p) => p.id !== photoId);
    if (removed.baseline || profile.baseline_photo_id === photoId) {
      profile = { ...profile, baseline_photo_id: null };
    }
  },

  async uploadPhotoSession(input: UploadPhotoSessionInput): Promise<PhotoSessionUploadResult> {
    const sessionId = `session-${Date.now()}`;
    const ts = Date.now();
    const session: PhotoSession = {
      id: sessionId,
      user_id: profile.id,
      date: input.date,
      baseline: input.baseline,
      metadata: input.metadata,
      created_at: new Date().toISOString(),
    };
    photoSessions = [session, ...photoSessions];

    const newPhotos: Photo[] = PHOTO_ANGLE_ORDER.map((angle, i) => ({
      id: `photo-${ts}-${angle}`,
      user_id: profile.id,
      image_url: input.angles[angle],
      date: input.date,
      metadata: input.metadata,
      baseline: input.baseline,
      session_id: sessionId,
      angle,
    }));

    photos = [...newPhotos, ...photos];

    const frontPhoto = getFrontPhoto(newPhotos)!;
    if (input.baseline) {
      profile = { ...profile, baseline_photo_id: frontPhoto.id };
    }

    streak = {
      ...streak,
      current_streak: streak.current_streak + 1,
      last_log_date: todayISO(),
    };

    return { session, photos: newPhotos, frontPhoto };
  },

  async uploadPhoto(photo: Omit<Photo, 'id'> & { localUri?: string }): Promise<Photo> {
    const newPhoto: Photo = {
      ...photo,
      id: `photo-${Date.now()}`,
      image_url: photo.localUri ?? photo.image_url,
      session_id: photo.session_id ?? null,
      angle: photo.angle ?? null,
    };
    photos = [newPhoto, ...photos];
    if (photo.baseline) {
      profile = { ...profile, baseline_photo_id: newPhoto.id };
    }
    streak = {
      ...streak,
      current_streak: streak.current_streak + 1,
      last_log_date: todayISO(),
    };
    return newPhoto;
  },

  async getProducts(): Promise<Product[]> {
    return products.map(withNormalizedInterval);
  },

  async saveProducts(items: Product[]): Promise<Product[]> {
    products = items.map((p) =>
      withNormalizedInterval({
        ...p,
        usage_interval_days: normalizeUsageInterval(p.usage_interval_days),
      })
    );
    routineLog = {
      ...routineLog,
      date: todayISO(),
      morning_completed: [],
      night_completed: [],
    };
    return products;
  },

  async addProduct(
    product: Omit<Product, 'id' | 'user_id'> & { id?: string }
  ): Promise<Product> {
    const newProduct: Product = withNormalizedInterval({
      ...product,
      id: product.id ?? `p-${Date.now()}`,
      user_id: profile.id,
      brand: product.brand ?? '',
      usage_interval_days: normalizeUsageInterval(product.usage_interval_days),
    });
    products = [...products, newProduct];
    return newProduct;
  },

  async updateProduct(
    productId: string,
    patch: Partial<Pick<Product, 'name' | 'brand' | 'routine_type' | 'usage_interval_days' | 'notes'>>
  ): Promise<Product> {
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) throw new Error('Product not found');
    const current = products[index];
    const updated = withNormalizedInterval({
      ...current,
      ...patch,
      brand: patch.brand !== undefined ? patch.brand : current.brand,
      usage_interval_days:
        patch.usage_interval_days !== undefined
          ? normalizeUsageInterval(patch.usage_interval_days)
          : current.usage_interval_days,
    });
    products = [...products.slice(0, index), updated, ...products.slice(index + 1)];
    return updated;
  },

  async deleteProduct(productId: string): Promise<void> {
    products = products.filter((p) => p.id !== productId);
    routineLog = {
      ...routineLog,
      morning_completed: routineLog.morning_completed.filter((id) => id !== productId),
      night_completed: routineLog.night_completed.filter((id) => id !== productId),
    };
  },

  async getTodayRoutine(): Promise<RoutineLog> {
    const date = todayISO();
    if (routineLog.date !== date) {
      routineLog =
        routineLogsByDate[date] ??
        ({
          id: `log-${date}`,
          user_id: profile.id,
          date,
          morning_completed: [],
          night_completed: [],
        } as RoutineLog);
    }
    routineLogsByDate[date] = routineLog;
    return routineLog;
  },

  async getRoutineLogsBetween(startDate: string, endDate: string): Promise<RoutineLog[]> {
    return Object.values(routineLogsByDate).filter(
      (log) => log.date >= startDate && log.date <= endDate
    );
  },

  async updateRoutine(log: Partial<RoutineLog>): Promise<RoutineLog> {
    const date = todayISO();
    routineLog = { ...routineLog, ...log, date };
    routineLogsByDate[date] = routineLog;
    const done =
      (routineLog.morning_completed?.length ?? 0) + (routineLog.night_completed?.length ?? 0) > 0;
    if (done && streak.last_log_date !== todayISO()) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const continued = streak.last_log_date === toLocalISODate(yesterday);
      const current_streak = continued ? streak.current_streak + 1 : 1;
      streak = {
        ...streak,
        current_streak,
        highest_streak: Math.max(current_streak, streak.highest_streak),
        last_log_date: todayISO(),
      };
    }
    return routineLog;
  },

  async getStreak(): Promise<Streak> {
    return streak;
  },

  async getInsights(): Promise<Insight[]> {
    return insights;
  },

  async createInsight(insight: Omit<Insight, 'id'>): Promise<Insight> {
    const newInsight: Insight = { ...insight, id: `insight-${Date.now()}` };
    insights = [newInsight, ...insights];
    return newInsight;
  },

  getWeeklySummary() {
    return computeWeeklySummary(
      photos,
      products,
      Object.values(routineLogsByDate),
      routineLog.date === todayISO() ? routineLog : undefined
    );
  },
};

export type DataProvider = typeof mockProvider;
