import type { MotionConfigNormalizer } from '../contracts/motion-config-normalizer';
import type { MotionConfig } from '../models/motion-config';
import type { NormalizedMotionConfig } from '../models/normalized-motion-config';
import type { ReducedMotionStrategy } from '../models/reduced-motion-strategy';
import { isRecord } from '../utils/is-record';
import { normalizeBoolean } from '../utils/normalize-boolean';
import { normalizeNumber } from '../utils/normalize-number';
import { normalizeString } from '../utils/normalize-string';

const DEFAULT_ID = 'motion_unknown';
const DEFAULT_TYPE = 'unknown';
const DEFAULT_TRIGGER = 'onEnter';
const DEFAULT_EASING = 'ease';

const MIN_DURATION = 0;
const MAX_DURATION = 5000;

const MIN_DELAY = 0;
const MAX_DELAY = 5000;

const ALLOWED_REDUCED_MOTION_STRATEGIES: ReadonlyArray<ReducedMotionStrategy> = [
  'skip',
  'simplify',
  'preserve'
];

export class DefaultMotionConfigNormalizer implements MotionConfigNormalizer {
  normalize(config: MotionConfig): NormalizedMotionConfig {
    return {
      id: normalizeString(config.id, DEFAULT_ID),
      type: normalizeString(config.type, DEFAULT_TYPE),
      trigger: normalizeString(config.trigger, DEFAULT_TRIGGER),
      enabled: normalizeBoolean(config.enabled, true),
      duration: normalizeNumber(config.duration, {
        defaultValue: 300,
        min: MIN_DURATION,
        max: MAX_DURATION
      }),
      delay: normalizeNumber(config.delay, {
        defaultValue: 0,
        min: MIN_DELAY,
        max: MAX_DELAY
      }),
      easing: normalizeString(config.easing, DEFAULT_EASING),
      options: isRecord(config.options) ? config.options : {},
      respectReducedMotion: normalizeBoolean(config.respectReducedMotion, true),
      reducedMotionStrategy: this.normalizeReducedMotionStrategy(
        config.reducedMotionStrategy
      ),
      priority: normalizeNumber(config.priority, {
        defaultValue: 0,
        integer: true
      }),
      metadata: isRecord(config.metadata) ? config.metadata : {}
    };
  }

  private normalizeReducedMotionStrategy(
    value: unknown
  ): ReducedMotionStrategy {
    return ALLOWED_REDUCED_MOTION_STRATEGIES.includes(
      value as ReducedMotionStrategy
    )
      ? (value as ReducedMotionStrategy)
      : 'skip';
  }
}