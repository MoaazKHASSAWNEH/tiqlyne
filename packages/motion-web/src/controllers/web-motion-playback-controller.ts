import {
  BaseMotionPlaybackController,
  isTerminalPlaybackStatus,
  type MotionPlaybackController,
  type MotionPlaybackControllerStatus,
  type MotionPlaybackDirectionState,
  type MotionPlaybackState,
  type MotionPlaybackResult
} from '@structifyx/motion-core';

export class WebMotionPlaybackController
  extends BaseMotionPlaybackController
  implements MotionPlaybackController
{
  private currentStatus: MotionPlaybackControllerStatus = 'running';

  constructor(
    readonly id: string,
    private readonly animations: ReadonlyArray<Animation>,
    readonly finished: Promise<MotionPlaybackResult>
  ) {
    super();

    this.emit('start', this.currentStatus, this.currentStatus);

    this.finished
      .then((result) => {
        this.applyFinishedResult(result);
      })
      .catch((error: unknown) => {
        this.applyFinishedResult({
          status: 'failed',
          reason: 'web-playback-finished-promise-rejected',
          error
        });
      });
  }

  get status(): MotionPlaybackControllerStatus {
    return this.currentStatus;
  }

  getState(): MotionPlaybackState {
    const currentTime = this.resolveCurrentTime();
    const duration = this.resolveDuration();

    return {
      status: this.currentStatus,
      currentTime,
      duration,
      progress: resolveProgress(currentTime, duration),
      playbackRate: this.resolvePlaybackRate(),
      direction: this.resolvePlaybackDirection(),
      activeTrackIndexes: [],
      activeStepIndexes: []
    };
  }

  async seek(time: number): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('seek');
    }

    if (!Number.isFinite(time)) {
      return this.createInvalidSeekTimeResult(time);
    }

    return this.seekAnimations(time);
  }

  async pause(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('pause');
    }

    if (this.currentStatus === 'paused') {
      return this.createInvalidTransitionResult('pause');
    }

    const result = this.pauseAnimations();

    const previousStatus = this.currentStatus;
    this.currentStatus = result.status;

    this.emitResult(result, previousStatus);

    return result;
  }

  async resume(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('resume');
    }

    if (this.currentStatus !== 'paused') {
      return this.createInvalidTransitionResult('resume');
    }

    const result = this.resumeAnimations();

    const previousStatus = this.currentStatus;
    this.currentStatus = result.status;

    this.emitResult(result, previousStatus);

    return result;
  }

  async cancel(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('cancel');
    }

    const result = this.cancelAnimations();

    const previousStatus = this.currentStatus;
    this.currentStatus = result.status;

    this.emitResult(result, previousStatus);

    return result;
  }

  async finish(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('finish');
    }

    if (this.hasInfiniteAnimation()) {
      const result = this.createFinishNotSupportedForInfiniteAnimationResult();
      const previousStatus = this.currentStatus;

      this.emitResult(result, previousStatus);

      return result;
    }

    const result = this.finishAnimations();

    const previousStatus = this.currentStatus;
    this.currentStatus = result.status;

    this.emitResult(result, previousStatus);

    return result;
  }

  private resolveCurrentTime(): number | null {
    const times = this.animations
      .map((animation) => normalizeNumberish(animation.currentTime))
      .filter(isFiniteNumber);

    if (times.length === 0) {
      return null;
    }

    return Math.max(...times);
  }

  private resolveDuration(): number | null {
    const durations = this.animations
      .map((animation) => {
        const effect = animation.effect;

        if (effect === null || effect === undefined) {
          return null;
        }

        return normalizeNumberish(effect.getComputedTiming().endTime);
      })
      .filter(isFiniteNumber);

    if (durations.length === 0) {
      return null;
    }

    return Math.max(...durations);
  }

  private resolvePlaybackRate(): number {
    return this.animations[0]?.playbackRate ?? 1;
  }

  private resolvePlaybackDirection(): MotionPlaybackDirectionState {
    return this.resolvePlaybackRate() < 0 ? 'backward' : 'forward';
  }

  private resolveSeekResultStatus(): 'running' | 'paused' {
    return this.currentStatus === 'paused' ? 'paused' : 'running';
  }

  private applyFinishedResult(result: MotionPlaybackResult): void {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return;
    }

    if (result.status === 'running') {
      return;
    }

    const previousStatus = this.currentStatus;
    this.currentStatus = result.status;

    this.emitResult(result, previousStatus);
  }

  private emitResult(
    result: MotionPlaybackResult,
    previousStatus: MotionPlaybackControllerStatus
  ): void {
    switch (result.status) {
      case 'finished':
        this.emitStatusChange('finish', this.currentStatus, previousStatus, result);
        break;

      case 'cancelled':
        this.emitStatusChange('cancel', this.currentStatus, previousStatus, result);
        break;

      case 'skipped':
        this.emitStatusChange('skip', this.currentStatus, previousStatus, result);
        break;

      case 'failed':
        this.emitStatusChange('fail', this.currentStatus, previousStatus, result);
        break;

      case 'paused':
        this.emitStatusChange('pause', this.currentStatus, previousStatus, result);
        break;

      case 'running':
        this.emitStatusChange('resume', this.currentStatus, previousStatus, result);
        break;
    }
  }

  private createInvalidTransitionResult(action: string): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: `web-playback-${action}-not-allowed-from-${this.currentStatus}`,
      diagnostics: [
        {
          level: 'warning',
          code: 'playback-invalid-transition',
          message: `Cannot run "${action}" while playback is "${this.currentStatus}".`,
          source: 'web-motion-playback-controller',
          metadata: {
            action,
            currentStatus: this.currentStatus
          }
        }
      ]
    };
  }

  private seekAnimations(time: number): MotionPlaybackResult {
    try {
      for (const animation of this.animations) {
        animation.currentTime = time;
      }

      return {
        status: this.resolveSeekResultStatus(),
        reason: 'web-playback-seek'
      };
    } catch (error) {
      return {
        status: 'failed',
        reason: 'web-playback-seek-failed',
        error,
        diagnostics: [
          {
            level: 'error',
            code: 'web-playback-seek-failed',
            message: 'Web playback could not seek safely.',
            source: 'web-motion-playback-controller',
            metadata: {
              time
            }
          }
        ]
      };
    }
  }

  private createInvalidSeekTimeResult(time: number): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: 'web-playback-seek-invalid-time',
      diagnostics: [
        {
          level: 'warning',
          code: 'web-playback-seek-invalid-time',
          message: 'Web playback seek time must be a finite number.',
          source: 'web-motion-playback-controller',
          metadata: {
            time
          }
        }
      ]
    };
  }

  private pauseAnimations(): MotionPlaybackResult {
    try {
      for (const animation of this.animations) {
        animation.pause();
      }

      return {
        status: 'paused',
        reason: 'web-playback-pause'
      };
    } catch (error) {
      return {
        status: 'failed',
        reason: 'web-playback-pause-failed',
        error,
        diagnostics: [
          {
            level: 'error',
            code: 'web-playback-pause-failed',
            message: 'Web playback could not be paused safely.',
            source: 'web-motion-playback-controller'
          }
        ]
      };
    }
  }

  private resumeAnimations(): MotionPlaybackResult {
    try {
      for (const animation of this.animations) {
        animation.play();
      }

      return {
        status: 'running',
        reason: 'web-playback-resume'
      };
    } catch (error) {
      return {
        status: 'failed',
        reason: 'web-playback-resume-failed',
        error,
        diagnostics: [
          {
            level: 'error',
            code: 'web-playback-resume-failed',
            message: 'Web playback could not be resumed safely.',
            source: 'web-motion-playback-controller'
          }
        ]
      };
    }
  }

  private cancelAnimations(): MotionPlaybackResult {
    try {
      for (const animation of this.animations) {
        animation.cancel();
      }

      return {
        status: 'cancelled',
        reason: 'web-playback-cancel'
      };
    } catch (error) {
      return {
        status: 'failed',
        reason: 'web-playback-cancel-failed',
        error,
        diagnostics: [
          {
            level: 'error',
            code: 'web-playback-cancel-failed',
            message: 'Web playback could not be cancelled safely.',
            source: 'web-motion-playback-controller'
          }
        ]
      };
    }
  }

  private hasInfiniteAnimation(): boolean {
    return this.animations.some((animation) => {
      const effect = animation.effect;

      if (effect === null || effect === undefined) {
        return false;
      }

      const timing = effect.getComputedTiming();

      return timing.iterations === Number.POSITIVE_INFINITY;
    });
  }

  private createFinishNotSupportedForInfiniteAnimationResult(): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: 'web-playback-finish-not-supported-for-infinite-animation',
      diagnostics: [
        {
          level: 'warning',
          code: 'web-playback-finish-not-supported-for-infinite-animation',
          message:
            'Web playback cannot finish an infinite animation. Use cancel() or reset() instead.',
          source: 'web-motion-playback-controller'
        }
      ]
    };
  }

  private finishAnimations(): MotionPlaybackResult {
    try {
      for (const animation of this.animations) {
        animation.finish();
      }

      return {
        status: 'finished',
        reason: 'web-playback-finish'
      };
    } catch (error) {
      return {
        status: 'failed',
        reason: 'web-playback-finish-failed',
        error,
        diagnostics: [
          {
            level: 'error',
            code: 'web-playback-finish-failed',
            message: 'Web playback could not be finished safely.',
            source: 'web-motion-playback-controller'
          }
        ]
      };
    }
  }
}

function normalizeNumberish(value: CSSNumberish | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isFiniteNumber(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function resolveProgress(currentTime: number | null, duration: number | null): number | null {
  if (currentTime === null || duration === null) {
    return null;
  }

  if (duration === 0) {
    return 1;
  }

  return Math.min(Math.max(currentTime / duration, 0), 1);
}
