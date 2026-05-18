import type { PhotoAngle, PhotoMetadata, PhotoSessionUploadResult } from '@/types';

export type PhotoSessionAngleUris = Record<PhotoAngle, string>;

export interface UploadPhotoSessionInput {
  date: string;
  baseline: boolean;
  metadata: PhotoMetadata;
  angles: PhotoSessionAngleUris;
}

export type { PhotoSessionUploadResult };
