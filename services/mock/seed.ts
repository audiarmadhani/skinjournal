import type {
  Insight,
  Photo,
  PhotoAngle,
  PhotoSession,
  Product,
  Profile,
  RoutineLog,
  SkinGoal,
  Streak,
} from '@/types';
import { todayISO, toLocalISODate } from '@/utils/dates';

const MOCK_USER_ID = 'mock-user-audi';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalISODate(d);
}

export const MOCK_PROFILE: Profile = {
  id: MOCK_USER_ID,
  name: 'Audi',
  email: 'audi@example.com',
  skin_goals: ['hydration', 'texture', 'redness'] as SkinGoal[],
  concerns: ['redness', 'texture'],
  onboarding_completed: true,
  baseline_photo_id: 'photo-baseline-front',
  subscription_tier: 'free',
  premium_expires_at: null,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  location_latitude: null,
  location_longitude: null,
  location_accuracy_m: null,
  location_city: null,
  location_region: null,
  location_country: null,
  location_captured_at: null,
  age_years: null,
  sex: null,
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=500&fit=crop';

const ANGLES: PhotoAngle[] = ['front', 'left', 'right'];

function buildSessionPhotos(opts: {
  sessionId: string;
  date: string;
  baseline: boolean;
  idPrefix: string;
}): Photo[] {
  return ANGLES.map((angle) => ({
    id: `${opts.idPrefix}-${angle}`,
    user_id: MOCK_USER_ID,
    image_url: PLACEHOLDER,
    date: opts.date,
    metadata: {
      time: '09:00',
      lighting_quality: 'good' as const,
      device_info: 'iPhone',
    },
    baseline: opts.baseline,
    session_id: opts.sessionId,
    angle,
  }));
}

export const MOCK_PHOTO_SESSIONS: PhotoSession[] = [
  {
    id: 'session-baseline',
    user_id: MOCK_USER_ID,
    date: daysAgo(30),
    baseline: true,
    metadata: { time: '09:00', lighting_quality: 'good', device_info: 'iPhone' },
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  ...Array.from({ length: 4 }, (_, i) => {
    const day = 24 - i * 6;
    return {
      id: `session-${i + 1}`,
      user_id: MOCK_USER_ID,
      date: daysAgo(day),
      baseline: false,
      metadata: { time: '09:00', lighting_quality: i % 2 === 0 ? ('good' as const) : ('fair' as const), device_info: 'iPhone' },
      created_at: new Date(Date.now() - day * 86400000).toISOString(),
    };
  }),
];

export const MOCK_PHOTOS: Photo[] = [
  ...buildSessionPhotos({
    sessionId: 'session-baseline',
    date: daysAgo(30),
    baseline: true,
    idPrefix: 'photo-baseline',
  }),
  ...MOCK_PHOTO_SESSIONS.filter((s) => !s.baseline).flatMap((s, i) =>
    buildSessionPhotos({
      sessionId: s.id,
      date: s.date,
      baseline: false,
      idPrefix: `photo-s${i + 1}`,
    })
  ),
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    user_id: MOCK_USER_ID,
    name: 'Cleanser',
    brand: 'CeraVe',
    routine_type: 'morning',
    started_at: daysAgo(30),
    usage_interval_days: 1,
  },
  {
    id: 'p2',
    user_id: MOCK_USER_ID,
    name: 'Serum',
    brand: 'The Ordinary',
    routine_type: 'morning',
    started_at: daysAgo(30),
    usage_interval_days: 1,
  },
  {
    id: 'p3',
    user_id: MOCK_USER_ID,
    name: 'Sunscreen',
    brand: 'La Roche-Posay',
    routine_type: 'morning',
    started_at: daysAgo(30),
    usage_interval_days: 1,
  },
  {
    id: 'p4',
    user_id: MOCK_USER_ID,
    name: 'Cleanser',
    brand: 'CeraVe',
    routine_type: 'night',
    started_at: daysAgo(30),
    usage_interval_days: 1,
  },
  {
    id: 'p5',
    user_id: MOCK_USER_ID,
    name: 'Retinol',
    brand: 'Paula\'s Choice',
    routine_type: 'night',
    started_at: daysAgo(14),
    usage_interval_days: 3,
  },
  {
    id: 'p6',
    user_id: MOCK_USER_ID,
    name: 'Moisturizer',
    brand: 'Vanicream',
    routine_type: 'night',
    started_at: daysAgo(30),
    usage_interval_days: 1,
  },
];

export const MOCK_ROUTINE_LOG: RoutineLog = {
  id: 'log-today',
  user_id: MOCK_USER_ID,
  date: todayISO(),
  morning_completed: ['p1', 'p2'],
  night_completed: ['p4'],
};

export const MOCK_INSIGHTS: Insight[] = [
  {
    id: 'insight-1',
    photo_id: 'photo-s4-front',
    user_id: MOCK_USER_ID,
    summary: 'Visible redness appears reduced compared with your baseline.',
    generated_at: new Date().toISOString(),
    source: 'template',
  },
  {
    id: 'insight-2',
    photo_id: null,
    user_id: MOCK_USER_ID,
    summary: 'Skin texture appears more even over the last two weeks.',
    generated_at: new Date().toISOString(),
    source: 'template',
  },
];

export const MOCK_STREAK: Streak = {
  id: 'streak-1',
  user_id: MOCK_USER_ID,
  current_streak: 12,
  highest_streak: 14,
  last_log_date: todayISO(),
};

export const MOCK_SESSION = {
  user: { id: MOCK_USER_ID, email: MOCK_PROFILE.email },
  access_token: 'mock-token',
};
