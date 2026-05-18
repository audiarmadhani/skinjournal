import type { PhotoAngle } from '@/types';

export const PHOTO_ANGLE_ORDER: PhotoAngle[] = ['front', 'left', 'right'];

export const PHOTO_ANGLE_STEP_TOTAL = PHOTO_ANGLE_ORDER.length;

export const PHOTO_ANGLE_LABELS: Record<PhotoAngle, string> = {
  front: 'Front',
  left: 'Left',
  right: 'Right',
};

export const PHOTO_ANGLE_INSTRUCTIONS: Record<PhotoAngle, string> = {
  front: 'Face the camera directly · neutral expression',
  left: 'Turn your head to show your left cheek to the camera',
  right: 'Turn your head to show your right cheek to the camera',
};

export function getAngleStepIndex(angle: PhotoAngle): number {
  return PHOTO_ANGLE_ORDER.indexOf(angle) + 1;
}

export function getNextAngle(angle: PhotoAngle): PhotoAngle | null {
  const i = PHOTO_ANGLE_ORDER.indexOf(angle);
  if (i < 0 || i >= PHOTO_ANGLE_ORDER.length - 1) return null;
  return PHOTO_ANGLE_ORDER[i + 1];
}
