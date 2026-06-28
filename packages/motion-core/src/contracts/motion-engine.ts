import type { MotionConfig } from '../models/motion-config';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { MotionPlaybackController } from '../models/motion-playback-controller';
import type { MotionExecutionPlan } from '../models/motion-execution-plan';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import type { MotionTimelinePlayOptions } from '../models/motion-timeline-play-options';
import type { MotionDefinition } from './motion-definition';
import type { MotionCategory } from '../models/motion-category';
import type { MotionCompositionDefinition } from '../composition/motion-composition-definition';

export interface MotionEngine<TTarget = unknown> {
  register<TOptions extends object>(definition: MotionDefinition<TOptions>): MotionEngine<TTarget>;

  registerMany(definitions: ReadonlyArray<MotionDefinition<object>>): MotionEngine<TTarget>;

  has(type: string): boolean;

  get(type: string): MotionDefinition<object> | undefined;

  getAll(): ReadonlyArray<MotionDefinition<object>>;

  getByCategory(category: MotionCategory): ReadonlyArray<MotionDefinition<object>>;

  play(target: TTarget, config: MotionConfig): Promise<MotionPlaybackResult>;

  playTimeline(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): Promise<MotionPlaybackResult>;

  cancel(target: TTarget): Promise<MotionPlaybackResult>;

  finish(target: TTarget): Promise<MotionPlaybackResult>;

  reset(target: TTarget): Promise<MotionPlaybackResult>;

  createPlayback(target: TTarget, config: MotionConfig): MotionPlaybackController;

  createTimelinePlayback(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionPlaybackController;

  plan(config: MotionConfig): MotionExecutionPlan;

  planTimeline(
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionExecutionPlan;

  playComposition(
    target: TTarget,
    composition: MotionCompositionDefinition,
    options?: MotionTimelinePlayOptions
  ): Promise<MotionPlaybackResult>;

  createCompositionPlayback(
    target: TTarget,
    composition: MotionCompositionDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionPlaybackController;

  planComposition(
    composition: MotionCompositionDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionExecutionPlan;
}
