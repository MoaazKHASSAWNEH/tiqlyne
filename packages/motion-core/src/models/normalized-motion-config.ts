import type { ReducedMotionStrategy } from './reduced-motion-strategy';

export type NormalizedMotionConfig = {
  readonly id: string;
  readonly type: string;
  readonly trigger: string;
  readonly enabled: boolean;
  readonly duration: number;
  readonly delay: number;
  readonly easing: string;
  readonly options: Record<string, unknown>;
  readonly respectReducedMotion: boolean;
  readonly reducedMotionStrategy: ReducedMotionStrategy;
  readonly priority: number;
  readonly metadata: Record<string, unknown>;
};
