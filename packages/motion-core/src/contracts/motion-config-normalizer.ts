import type { MotionConfig } from '../models/motion-config';
import type { NormalizedMotionConfig } from '../models/normalized-motion-config';

/**
 * Normalizes raw motion configs into safe engine configs.
 *
 * Configs may come from JSON, databases, APIs or builders. A normalizer is
 * responsible for resolving defaults, clamping unsafe values and ensuring the
 * engine receives a complete {@link NormalizedMotionConfig}.
 */
export interface MotionConfigNormalizer {
  /**
   * Normalizes a raw motion config.
   *
   * @param config - Raw motion config.
   * @returns Safe normalized motion config.
   */
  normalize(config: MotionConfig): NormalizedMotionConfig;
}
