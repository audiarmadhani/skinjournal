import type { Photo, PhotoAngle } from '@/types';
import { PHOTO_ANGLES } from '@/types/database';

/** One journal entry: multi-angle session or legacy single photo. */
export interface PhotoSessionGroup {
  sessionId: string | null;
  date: string;
  baseline: boolean;
  /** Thumbnail and primary id (front angle, or legacy photo). */
  primaryPhoto: Photo;
  photos: Photo[];
  isMultiAngle: boolean;
}

function sortPhotosByAngle(photos: Photo[]): Photo[] {
  const order = new Map(PHOTO_ANGLES.map((a, i) => [a, i]));
  return [...photos].sort((a, b) => {
    const ai = a.angle ? (order.get(a.angle) ?? 99) : 99;
    const bi = b.angle ? (order.get(b.angle) ?? 99) : 99;
    return ai - bi;
  });
}

function pickPrimaryPhoto(photos: Photo[]): Photo {
  const front = photos.find((p) => p.angle === 'front');
  return front ?? photos[0];
}

/** Group flat photo rows into session entries for timeline/home. */
export function groupPhotosIntoSessions(photos: Photo[]): PhotoSessionGroup[] {
  const bySession = new Map<string, Photo[]>();
  const legacy: Photo[] = [];

  for (const p of photos) {
    if (p.session_id) {
      const list = bySession.get(p.session_id) ?? [];
      list.push(p);
      bySession.set(p.session_id, list);
    } else {
      legacy.push(p);
    }
  }

  const groups: PhotoSessionGroup[] = [];

  for (const [sessionId, sessionPhotos] of bySession) {
    const sorted = sortPhotosByAngle(sessionPhotos);
    const primary = pickPrimaryPhoto(sorted);
    groups.push({
      sessionId,
      date: primary.date,
      baseline: primary.baseline,
      primaryPhoto: primary,
      photos: sorted,
      isMultiAngle: sorted.length > 1,
    });
  }

  for (const p of legacy) {
    groups.push({
      sessionId: null,
      date: p.date,
      baseline: p.baseline,
      primaryPhoto: p,
      photos: [p],
      isMultiAngle: false,
    });
  }

  return groups.sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    if (d !== 0) return d;
    return b.primaryPhoto.id.localeCompare(a.primaryPhoto.id);
  });
}

export function getSessionPhotosForPhoto(
  allPhotos: Photo[],
  photo: Photo
): Photo[] {
  if (!photo.session_id) return [photo];
  const sessionPhotos = allPhotos.filter((p) => p.session_id === photo.session_id);
  return sortPhotosByAngle(sessionPhotos.length > 0 ? sessionPhotos : [photo]);
}

export function getPhotoForAngle(photos: Photo[], angle: PhotoAngle): Photo | undefined {
  return photos.find((p) => p.angle === angle);
}

export function getFrontPhoto(photos: Photo[]): Photo | undefined {
  return getPhotoForAngle(photos, 'front') ?? photos[0];
}

export function findTodaySession(
  groups: PhotoSessionGroup[],
  todayIso: string
): PhotoSessionGroup | undefined {
  return groups.find((g) => g.date === todayIso && !g.baseline);
}

export function findBaselineSession(groups: PhotoSessionGroup[]): PhotoSessionGroup | undefined {
  return groups.find((g) => g.baseline);
}

/** Count distinct journal sessions in date range (inclusive). */
export function countSessionsInRange(photos: Photo[], start: string, end: string): number {
  const groups = groupPhotosIntoSessions(photos ?? []);
  return groups.filter((g) => g.date >= start && g.date <= end).length;
}

export function getAdjacentSessionGroups(
  groups: PhotoSessionGroup[],
  primaryPhotoId: string
): { current: PhotoSessionGroup | null; prev: PhotoSessionGroup | null; next: PhotoSessionGroup | null } {
  const idx = groups.findIndex((g) => g.primaryPhoto.id === primaryPhotoId);
  if (idx < 0) return { current: null, prev: null, next: null };
  return {
    current: groups[idx],
    prev: idx > 0 ? groups[idx - 1] : null,
    next: idx < groups.length - 1 ? groups[idx + 1] : null,
  };
}

export function getBaselinePrimaryPhoto(photos: Photo[]): Photo | undefined {
  return findBaselineSession(groupPhotosIntoSessions(photos))?.primaryPhoto;
}

export function getLatestJournalPrimaryPhoto(photos: Photo[]): Photo | undefined {
  const groups = groupPhotosIntoSessions(photos).filter((g) => !g.baseline);
  return groups[0]?.primaryPhoto;
}
