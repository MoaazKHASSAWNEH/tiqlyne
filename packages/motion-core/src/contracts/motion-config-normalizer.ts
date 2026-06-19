import type { MotionConfig } from '../models/motion-config';
import type { NormalizedMotionConfig } from '../models/normalized-motion-config';

export interface MotionConfigNormalizer {
  normalize(config: MotionConfig): NormalizedMotionConfig;
}