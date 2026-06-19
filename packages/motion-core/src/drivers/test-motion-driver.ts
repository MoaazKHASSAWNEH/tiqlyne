import type { MotionDriver, MotionPlayOptions } from '../contracts/motion-driver';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

export type TestMotionDriverCall<TTarget = unknown> = {
  readonly target: TTarget;
  readonly timeline: MotionTimelineDefinition;
  readonly options: MotionPlayOptions;
};

export type TestMotionDriverControlCall<TTarget = unknown> = {
  readonly action: 'cancel' | 'finish' | 'reset';
  readonly target: TTarget;
};

export class TestMotionDriver<TTarget = unknown> implements MotionDriver<TTarget> {
  readonly name = 'test';

  private readonly calls: Array<TestMotionDriverCall<TTarget>> = [];
  private readonly controlCalls: Array<TestMotionDriverControlCall<TTarget>> = [];

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

  async cancel(target: TTarget): Promise<MotionPlaybackResult> {
    this.controlCalls.push({
      action: 'cancel',
      target
    });

    return {
      status: 'cancelled',
      reason: 'test-driver-cancel'
    };
  }

  async finish(target: TTarget): Promise<MotionPlaybackResult> {
    this.controlCalls.push({
      action: 'finish',
      target
    });

    return {
      status: 'finished',
      reason: 'test-driver-finish'
    };
  }

  async reset(target: TTarget): Promise<MotionPlaybackResult> {
    this.controlCalls.push({
      action: 'reset',
      target
    });

    return {
      status: 'finished',
      reason: 'test-driver-reset'
    };
  }

  getCalls(): ReadonlyArray<TestMotionDriverCall<TTarget>> {
    return this.calls;
  }

  getControlCalls(): ReadonlyArray<TestMotionDriverControlCall<TTarget>> {
    return this.controlCalls;
  }

  clear(): void {
    this.calls.length = 0;
    this.controlCalls.length = 0;
  }
}
