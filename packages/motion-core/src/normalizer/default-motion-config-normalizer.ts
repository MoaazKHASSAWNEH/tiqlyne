import type { MotionConfigNormalizer } from '../contracts/motion-config-normalizer';
import type { MotionConfig } from '../models/motion-config';
import type { MotionConflictStrategy } from '../models/motion-conflict-strategy';
import { isMotionConflictStrategy } from '../models/motion-conflict-strategy';
import type { MotionEasing } from '../models/motion-easing';
import type { MotionTriggerType } from '../models/motion-trigger';
import { isMotionTriggerType } from '../models/motion-trigger';
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

/**
 * Default implementation of {@link MotionConfigNormalizer}.
 *
 * The normalizer protects the engine from unsafe or incomplete config values by
 * resolving defaults, clamping duration/delay and validating known enum-like
 * fields such as trigger, reduced-motion strategy and conflict strategy.
 */
export class DefaultMotionConfigNormalizer implements MotionConfigNormalizer {
  /**
   * Normalizes a raw motion config into a complete engine config.
   */
  normalize(config: MotionConfig): NormalizedMotionConfig {
    return {
      id: normalizeString(config.id, DEFAULT_ID),
      type: normalizeString(config.type, DEFAULT_TYPE),
      trigger: this.normalizeTrigger(config.trigger),
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
      easing: this.normalizeEasing(config.easing),
      options: isRecord(config.options) ? config.options : {},
      respectReducedMotion: normalizeBoolean(config.respectReducedMotion, true),
      reducedMotionStrategy: this.normalizeReducedMotionStrategy(config.reducedMotionStrategy),
      conflictStrategy: this.normalizeConflictStrategy(config.conflictStrategy),
      priority: normalizeNumber(config.priority, {
        defaultValue: 0,
        integer: true
      }),
      metadata: isRecord(config.metadata) ? config.metadata : {}
    };
  }

  private normalizeEasing(value: MotionEasing | undefined): MotionEasing {
    if (value === undefined) {
      return DEFAULT_EASING;
    }

    if (typeof value === 'string') {
      return normalizeString(value, DEFAULT_EASING) as MotionEasing;
    }

    return value;
  }

  private normalizeConflictStrategy(value: unknown): MotionConflictStrategy {
    return isMotionConflictStrategy(value) ? value : 'replace';
  }

  private normalizeTrigger(value: unknown): MotionTriggerType {
    return isMotionTriggerType(value) ? value : DEFAULT_TRIGGER;
  }

  private normalizeReducedMotionStrategy(value: unknown): ReducedMotionStrategy {
    return ALLOWED_REDUCED_MOTION_STRATEGIES.includes(value as ReducedMotionStrategy)
      ? (value as ReducedMotionStrategy)
      : 'skip';
  }
}
