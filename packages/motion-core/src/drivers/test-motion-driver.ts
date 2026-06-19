import type {
  MotionDriver,
  MotionPlayOptions
} from '../contracts/motion-driver';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

export type TestMotionDriverCall<TTarget = unknown> = {
  readonly target: TTarget;
  readonly timeline: MotionTimelineDefinition;
  readonly options: MotionPlayOptions;
};

export class TestMotionDriver<TTarget = unknown> implements MotionDriver<TTarget> {
  readonly name = 'test';

  private readonly calls: Array<TestMotionDriverCall<TTarget>> = [];

  async play(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): Promise<MotionPlaybackResult> {
    this.calls.push({
      target,
      timeline,
      options
    });

    return {
      status: 'finished'
    };
  }

  getCalls(): ReadonlyArray<TestMotionDriverCall<TTarget>> {
    return this.calls;
  }

  clear(): void {
    this.calls.length = 0;
  }
}