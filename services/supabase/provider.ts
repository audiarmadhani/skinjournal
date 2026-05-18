import { getSupabase } from '@/lib/supabase';
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
import { todayISO } from '@/utils/dates';
import { normalizeUsageInterval, withNormalizedInterval } from '@/utils/product-schedule';
import { computeWeeklySummary, getLast7DaysBounds } from '@/utils/weekly-summary';
import { mockProvider } from '../mock/provider';
import { syncStreakFromRoutineLog } from '../streak-sync';

function requireSupabase() {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  return client;
}

function normalizeProfile(row: Partial<Profile> & { id: string }): Profile {
  return {
    ...row,
    subscription_tier: row.subscription_tier ?? 'free',
    premium_expires_at: row.premium_expires_at ?? null,
    location_latitude: row.location_latitude ?? null,
    location_longitude: row.location_longitude ?? null,
    location_accuracy_m: row.location_accuracy_m ?? null,
    location_city: row.location_city ?? null,
    location_region: row.location_region ?? null,
    location_country: row.location_country ?? null,
    location_captured_at: row.location_captured_at ?? null,
    age_years: row.age_years ?? null,
    sex: row.sex ?? null,
  } as Profile;
}

function normalizeProduct(row: Product): Product {
  return withNormalizedInterval(row);
}

function normalizePhoto(row: Photo): Photo {
  return {
    ...row,
    session_id: row.session_id ?? null,
    angle: row.angle ?? null,
  };
}

async function getUserId(): Promise<string> {
  const supabase = requireSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

export const supabaseProvider = {
  async getSession(): Promise<AppSession | null> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.getSession();
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    return {
      user: { id: data.session.user.id, email: data.session.user.email },
      access_token: data.session.access_token,
    };
  },

  async signIn(email: string, password: string): Promise<AppSession> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.signIn(email, password);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session?.user) throw new Error('No session');
    return {
      user: { id: data.session.user.id, email: data.session.user.email },
      access_token: data.session.access_token,
    };
  },

  async signUp(email: string, password: string, name: string): Promise<AppSession> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.signUp(email, password, name);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;

    if (data.session?.user) {
      await supabaseProvider.ensureProfile();
      return {
        user: { id: data.session.user.id, email: data.session.user.email },
        access_token: data.session.access_token,
      };
    }

    if (data.user) {
      throw new Error(
        'Account created. Check your email to verify your account, then sign in on the login screen.'
      );
    }

    throw new Error('Could not create account. Please try again.');
  },

  async signOut() {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.signOut();
    await supabase.auth.signOut();
  },

  async ensureProfile(): Promise<Profile> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.ensureProfile();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (existing) return normalizeProfile(existing as Profile);

    const meta = user.user_metadata ?? {};
    const name =
      (meta.full_name as string) ??
      (meta.name as string) ??
      user.email?.split('@')[0] ??
      'User';

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email ?? '',
        name,
        skin_goals: [],
        concerns: [],
        onboarding_completed: false,
        subscription_tier: 'free',
        premium_expires_at: null,
      } as never)
      .select()
      .single();

    if (error) throw error;
    return normalizeProfile(data as Profile);
  },

  async getProfile(): Promise<Profile> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.getProfile();
    const userId = await getUserId();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    if (data) return normalizeProfile(data as Profile);
    return supabaseProvider.ensureProfile();
  },

  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.updateProfile(updates);
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates as never)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return normalizeProfile(data as Profile);
  },

  async getPhotos(): Promise<Photo[]> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.getPhotos();
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => normalizePhoto(row as Photo));
  },

  async getPhoto(id: string): Promise<Photo | null> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.getPhoto(id);
    const { data, error } = await supabase.from('photos').select('*').eq('id', id).single();
    if (error) return null;
    return normalizePhoto(data as Photo);
  },

  async updatePhotoAnalysis(
    photoId: string,
    analysis: Record<string, unknown>
  ): Promise<Photo> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.updatePhotoAnalysis(photoId, analysis);
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('photos')
      .update({ analysis } as never)
      .eq('id', photoId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return normalizePhoto(data as Photo);
  },

  async uploadPhotoSession(input: UploadPhotoSessionInput): Promise<PhotoSessionUploadResult> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.uploadPhotoSession(input);
    const userId = await getUserId();

    const { data: sessionRow, error: sessionError } = await supabase
      .from('photo_sessions')
      .insert({
        user_id: userId,
        date: input.date,
        baseline: input.baseline,
        metadata: input.metadata,
      } as never)
      .select()
      .single();
    if (sessionError) throw sessionError;

    const session = sessionRow as PhotoSession;
    const uploaded: Photo[] = [];

    for (const angle of PHOTO_ANGLE_ORDER) {
      const localUri = input.angles[angle];
      const storagePath = `${userId}/${session.id}/${angle}.jpg`;
      const response = await fetch(localUri);
      if (!response.ok) {
        throw new Error('Could not read the photo from your device.');
      }
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage.from('photos').upload(storagePath, blob, {
        upsert: true,
        contentType: blob.type || 'image/jpeg',
      });
      if (uploadError) {
        throw new Error(uploadError.message || 'Could not upload photo to storage.');
      }
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(storagePath);

      const { data: photoRow, error: photoError } = await supabase
        .from('photos')
        .insert({
          user_id: userId,
          session_id: session.id,
          angle,
          image_url: urlData.publicUrl,
          storage_path: storagePath,
          date: input.date,
          metadata: input.metadata,
          baseline: input.baseline,
        } as never)
        .select()
        .single();
      if (photoError) throw photoError;
      uploaded.push(normalizePhoto(photoRow as Photo));
    }

    const frontPhoto = uploaded.find((p) => p.angle === 'front') ?? uploaded[0];
    return { session, photos: uploaded, frontPhoto };
  },

  async uploadPhoto(photo: Omit<Photo, 'id'> & { localUri?: string }): Promise<Photo> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.uploadPhoto(photo);
    const userId = await getUserId();
    const { localUri, ...row } = photo;
    let imageUrl = row.image_url;
    let storagePath: string | null = null;

    if (localUri) {
      storagePath = `${userId}/${row.date}-${Date.now()}.jpg`;
      const response = await fetch(localUri);
      if (!response.ok) {
        throw new Error('Could not read the photo from your device.');
      }
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage.from('photos').upload(storagePath, blob, {
        upsert: false,
        contentType: blob.type || 'image/jpeg',
      });
      if (uploadError) {
        throw new Error(uploadError.message || 'Could not upload photo to storage.');
      }
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(storagePath);
      imageUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        storage_path: storagePath,
        date: row.date,
        metadata: row.metadata ?? {},
        analysis: row.analysis ?? null,
        baseline: row.baseline ?? false,
      } as never)
      .select()
      .single();
    if (error) throw error;
    return normalizePhoto(data as Photo);
  },

  async deletePhoto(photoId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.deletePhoto(photoId);
    const userId = await getUserId();

    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('id, storage_path, baseline, session_id')
      .eq('id', photoId)
      .eq('user_id', userId)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!photo) return;

    const row = photo as Pick<Photo, 'id' | 'storage_path' | 'baseline' | 'session_id'>;

    if (row.session_id) {
      const { data: sessionPhotos, error: listError } = await supabase
        .from('photos')
        .select('id, storage_path, baseline')
        .eq('session_id', row.session_id)
        .eq('user_id', userId);
      if (listError) throw listError;

      const paths = (sessionPhotos ?? [])
        .map((p) => (p as Pick<Photo, 'storage_path'>).storage_path)
        .filter((p): p is string => Boolean(p));
      if (paths.length > 0) {
        await supabase.storage.from('photos').remove(paths);
      }

      const { error: deletePhotosError } = await supabase
        .from('photos')
        .delete()
        .eq('session_id', row.session_id)
        .eq('user_id', userId);
      if (deletePhotosError) throw deletePhotosError;

      await supabase.from('photo_sessions').delete().eq('id', row.session_id).eq('user_id', userId);

      const hadBaseline = (sessionPhotos ?? []).some((p) => (p as Photo).baseline);
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('baseline_photo_id')
        .eq('id', userId)
        .maybeSingle();
      const baselineId = (profileRow as Profile | null)?.baseline_photo_id;
      const clearedBaseline =
        hadBaseline ||
        (sessionPhotos ?? []).some((p) => (p as Photo).id === baselineId);
      if (clearedBaseline) {
        await supabase
          .from('profiles')
          .update({ baseline_photo_id: null } as never)
          .eq('id', userId);
      }
      return;
    }

    if (row.storage_path) {
      await supabase.storage.from('photos').remove([row.storage_path]);
    }

    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', userId);
    if (deleteError) throw deleteError;

    if (row.baseline) {
      await supabase
        .from('profiles')
        .update({ baseline_photo_id: null } as never)
        .eq('id', userId);
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('baseline_photo_id')
        .eq('id', userId)
        .maybeSingle();
      if ((profile as Profile | null)?.baseline_photo_id === photoId) {
        await supabase
          .from('profiles')
          .update({ baseline_photo_id: null } as never)
          .eq('id', userId);
      }
    }
  },

  async getProducts(): Promise<Product[]> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.getProducts();
    const userId = await getUserId();
    const { data, error } = await supabase.from('products').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).map((row) => normalizeProduct(row as Product));
  },

  /** Replace entire product catalog (onboarding only — resets product ids). */
  async saveProducts(items: Product[]): Promise<Product[]> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.saveProducts(items);
    const userId = await getUserId();
    await supabase.from('products').delete().eq('user_id', userId);

    if (items.length === 0) return [];

    const toInsert = items.map((p) => ({
      user_id: userId,
      name: p.name,
      brand: p.brand?.trim() || '',
      routine_type: p.routine_type,
      started_at: p.started_at,
      usage_interval_days: normalizeUsageInterval(p.usage_interval_days),
      notes: p.notes ?? null,
    }));

    const { data, error } = await supabase.from('products').insert(toInsert as never).select();
    if (error) throw error;

    const today = todayISO();
    await supabase
      .from('routine_logs')
      .upsert(
        {
          user_id: userId,
          date: today,
          morning_completed: [],
          night_completed: [],
        } as never,
        { onConflict: 'user_id,date' }
      );

    return (data ?? []).map((row) => normalizeProduct(row as Product));
  },

  async addProduct(
    product: Omit<Product, 'id' | 'user_id'> & { id?: string }
  ): Promise<Product> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.addProduct(product);
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: userId,
        name: product.name,
        brand: product.brand?.trim() || '',
        routine_type: product.routine_type,
        started_at: product.started_at,
        usage_interval_days: normalizeUsageInterval(product.usage_interval_days),
        notes: product.notes ?? null,
      } as never)
      .select()
      .single();
    if (error) throw error;
    return normalizeProduct(data as Product);
  },

  async updateProduct(
    productId: string,
    patch: Partial<Pick<Product, 'name' | 'brand' | 'routine_type' | 'usage_interval_days' | 'notes'>>
  ): Promise<Product> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.updateProduct(productId, patch);
    const userId = await getUserId();
    const payload: Record<string, unknown> = { ...patch };
    if (patch.brand !== undefined) payload.brand = patch.brand.trim();
    if (patch.usage_interval_days !== undefined) {
      payload.usage_interval_days = normalizeUsageInterval(patch.usage_interval_days);
    }
    const { data, error } = await supabase
      .from('products')
      .update(payload as never)
      .eq('id', productId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return normalizeProduct(data as Product);
  },

  async deleteProduct(productId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.deleteProduct(productId);
    const userId = await getUserId();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('user_id', userId);
    if (error) throw error;

    const date = todayISO();
    const { data: log } = await supabase
      .from('routine_logs')
      .select('morning_completed, night_completed')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (log) {
      const row = log as RoutineLog;
      await supabase
        .from('routine_logs')
        .update({
          morning_completed: (row.morning_completed ?? []).filter((id) => id !== productId),
          night_completed: (row.night_completed ?? []).filter((id) => id !== productId),
        } as never)
        .eq('user_id', userId)
        .eq('date', date);
    }
  },

  async getRoutineLogsBetween(startDate: string, endDate: string): Promise<RoutineLog[]> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.getRoutineLogsBetween(startDate, endDate);
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('routine_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);
    if (error) throw error;
    return (data ?? []) as RoutineLog[];
  },

  async getTodayRoutine(): Promise<RoutineLog> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.getTodayRoutine();
    const userId = await getUserId();
    const date = todayISO();
    const { data } = await supabase
      .from('routine_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (data) return data as RoutineLog;

    const { data: created, error } = await supabase
      .from('routine_logs')
      .insert({
        user_id: userId,
        date,
        morning_completed: [],
        night_completed: [],
      } as never)
      .select()
      .single();
    if (error) throw error;
    return created as RoutineLog;
  },

  async updateRoutine(log: Partial<RoutineLog>): Promise<RoutineLog> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.updateRoutine(log);
    const userId = await getUserId();
    const date = todayISO();

    const { data: existingRow } = await supabase
      .from('routine_logs')
      .select('morning_completed, night_completed')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    const morning_completed =
      log.morning_completed ?? (existingRow as RoutineLog | null)?.morning_completed ?? [];
    const night_completed =
      log.night_completed ?? (existingRow as RoutineLog | null)?.night_completed ?? [];

    const { data, error } = await supabase
      .from('routine_logs')
      .upsert(
        {
          user_id: userId,
          date,
          morning_completed,
          night_completed,
        } as never,
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();
    if (error) throw error;
    const updated = data as RoutineLog;
    await syncStreakFromRoutineLog(userId, updated);
    return updated;
  },

  async getStreak(): Promise<Streak> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.getStreak();
    const userId = await getUserId();
    const { data } = await supabase.from('streaks').select('*').eq('user_id', userId).maybeSingle();
    if (data) return data as Streak;
    const { data: created, error } = await supabase
      .from('streaks')
      .insert({ user_id: userId, current_streak: 0, highest_streak: 0 } as never)
      .select()
      .single();
    if (error) throw error;
    return created as Streak;
  },

  async getInsights(): Promise<Insight[]> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.getInsights();
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Insight[];
  },

  async createInsight(insight: Omit<Insight, 'id'>): Promise<Insight> {
    const supabase = getSupabase();
    if (!supabase) return mockProvider.createInsight(insight);
    const { data, error } = await supabase.from('insights').insert(insight as never).select().single();
    if (error) throw error;
    return data as Insight;
  },

  async getWeeklySummary() {
    const photos = await supabaseProvider.getPhotos();
    const products = await supabaseProvider.getProducts();
    const { start, end } = getLast7DaysBounds();
    const weekLogs = await supabaseProvider.getRoutineLogsBetween(start, end);
    const todayRoutine = await supabaseProvider.getTodayRoutine();
    return computeWeeklySummary(photos, products, weekLogs, todayRoutine);
  },
};
