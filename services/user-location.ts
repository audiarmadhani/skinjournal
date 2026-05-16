import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import type { Profile } from '@/types';
import { data } from '@/services/data-provider';

const TERMINAL_KEY_PREFIX = '@skinjournal/location_capture_terminal_v1:';

function terminalKey(userId: string): string {
  return `${TERMINAL_KEY_PREFIX}${userId}`;
}

let inFlightByUser: Record<string, Promise<void> | undefined> = {};

async function markTerminalAttempt(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(terminalKey(userId), '1');
  } catch {
    /* ignore */
  }
}

async function hasTerminalAttempt(userId: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(terminalKey(userId))) === '1';
  } catch {
    return false;
  }
}

/**
 * Requests foreground location once per account on this device (until saved or declined),
 * then persists coordinates + optional reverse-geocode labels on the user profile.
 * Skips if `location_captured_at` is already set on the profile.
 */
export async function captureAndPersistUserLocationOnce(
  queryClient: QueryClient,
  profile: Profile
): Promise<void> {
  const userId = profile.id;
  if (profile.location_captured_at != null) return;

  if (await hasTerminalAttempt(userId)) return;

  let slot = inFlightByUser[userId];
  if (slot) return slot;

  slot = (async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) return;

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) return;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = pos.coords;
      const accuracy = pos.coords.accuracy;

      let city: string | null = null;
      let region: string | null = null;
      let country: string | null = null;

      try {
        const places = await Location.reverseGeocodeAsync({ latitude, longitude });
        const place = places[0];
        if (place) {
          city = place.city ?? place.subregion ?? place.district ?? null;
          region = place.region ?? null;
          country = place.country ?? null;
        }
      } catch {
        /* reverse geocode is best-effort */
      }

      const capturedAt = new Date().toISOString();

      await data.updateProfile({
        location_latitude: latitude,
        location_longitude: longitude,
        location_accuracy_m: Number.isFinite(accuracy) ? accuracy : null,
        location_city: city,
        location_region: region,
        location_country: country,
        location_captured_at: capturedAt,
      });

      await queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch {
      /* permission denied, missing columns, or transient GPS errors — do not retry forever */
    } finally {
      await markTerminalAttempt(userId);
      delete inFlightByUser[userId];
    }
  })();

  inFlightByUser[userId] = slot;
  return slot;
}
