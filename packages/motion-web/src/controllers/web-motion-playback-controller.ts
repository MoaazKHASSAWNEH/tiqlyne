import {
  BaseMotionPlaybackController,
  isTerminalPlaybackStatus,
  sampleMotionTimelineAtTime,
  type MotionTimelineDefinition,
  type MotionPlaybackController,
  type MotionPlaybackControllerStatus,
  type MotionPlaybackDirectionState,
  type MotionPlaybackState,
  type MotionTimelineLabels,
  type MotionPlaybackResult
} from '@structifyx/motion-core';

type ActivePlaybackIndexes = {
  readonly trackIndexes: ReadonlyArray<number>;
  readonly stepIndexes: ReadonlyArray<number>;
};

export class WebMotionPlaybackController
  extends BaseMotionPlaybackController
  implements MotionPlaybackController
{
  private currentStatus: MotionPlaybackControllerStatus = 'running';

  constructor(
    readonly id: string,
    private readonly animations: ReadonlyArray<Animation>,
    readonly finished: Promise<MotionPlaybackResult>,
    private readonly labels: MotionTimelineLabels = {},
    private readonly timeline?: MotionTimelineDefinition
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
    const currentLabel = this.resolveCurrentLabel(currentTime);
    const activeIndexes = this.resolveActiveIndexes(currentTime);

    return {
      status: this.currentStatus,
      currentTime,
      duration,
      progress: resolveProgress(currentTime, duration),
      playbackRate: this.resolvePlaybackRate(),
      direction: this.resolvePlaybackDirection(),
      activeTrackIndexes: activeIndexes.trackIndexes,
      activeStepIndexes: activeIndexes.stepIndexes,
      ...(currentLabel !== undefined
        ? {
            currentLabel
          }
        : {})
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

  async seekProgress(progress: number): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('seekProgress');
    }

    if (!Number.isFinite(progress)) {
      return this.createInvalidSeekProgressResult(progress);
    }

    const duration = this.resolveDuration();

    if (duration === null || duration === Infinity) {
      return this.createSeekProgressDurationUnavailableResult(progress);
    }

    const time = clampProgress(progress) * duration;

    return this.seekAnimations(time);
  }

  async jumpToLabel(label: string): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('jumpToLabel');
    }

    if (label.trim().length === 0) {
      return this.createInvalidJumpToLabelResult(label);
    }

    const time = this.labels[label];

    if (time === undefined) {
      return this.createUnknownJumpToLabelResult(label);
    }

    return this.seekAnimations(time);
  }

  async playForward(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('playForward');
    }

    const result = this.playAnimationsInDirection('forward');

    this.applyDirectionalPlaybackResult(result);

    return result;
  }

  async playBackward(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('playBackward');
    }

    const result = this.playAnimationsInDirection('backward');

    this.applyDirectionalPlaybackResult(result);

    return result;
  }

  async setPlaybackRate(rate: number): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('setPlaybackRate');
    }

    if (!Number.isFinite(rate) || rate <= 0) {
      return this.createInvalidPlaybackRateResult(rate);
    }

    return this.setAnimationsPlaybackRate(rate);
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

  private resolveCurrentLabel(currentTime: number | null): string | undefined {
    if (currentTime === null) {
      return undefined;
    }

    const entries = Object.entries(this.labels)
      .filter((entry): entry is [string, number] => Number.isFinite(entry[1]))
      .sort((left, right) => left[1] - right[1]);

    let currentLabel: string | undefined;

    for (const [label, time] of entries) {
      if (time > currentTime) {
        break;
      }

      currentLabel = label;
    }

    return currentLabel;
  }

  private resolveActiveIndexes(currentTime: number | null): ActivePlaybackIndexes {
    if (currentTime === null || this.timeline === undefined) {
      return {
        trackIndexes: [],
        stepIndexes: []
      };
    }

    try {
      const sample = sampleMotionTimelineAtTime(this.timeline, currentTime);

      return {
        trackIndexes: uniqueNumbers(sample.activeSteps.map((step) => step.trackIndex)),
        stepIndexes: sample.activeSteps.map((step) => step.stepIndex)
      };
    } catch {
      return {
        trackIndexes: [],
        stepIndexes: []
      };
    }
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

  private createInvalidSeekProgressResult(progress: number): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: 'web-playback-seek-progress-invalid-progress',
      diagnostics: [
        {
          level: 'warning',
          code: 'web-playback-seek-progress-invalid-progress',
          message: 'Web playback seek progress must be a finite number.',
          source: 'web-motion-playback-controller',
          metadata: {
            progress
          }
        }
      ]
    };
  }

  private createSeekProgressDurationUnavailableResult(progress: number): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: 'web-playback-seek-progress-duration-unavailable',
      diagnostics: [
        {
          level: 'warning',
          code: 'web-playback-seek-progress-duration-unavailable',
          message: 'Web playback cannot seek by progress without a finite duration.',
          source: 'web-motion-playback-controller',
          metadata: {
            progress
          }
        }
      ]
    };
  }

  private createInvalidJumpToLabelResult(label: string): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: 'web-playback-jump-to-label-invalid-label',
      diagnostics: [
        {
          level: 'warning',
          code: 'web-playback-jump-to-label-invalid-label',
          message: 'Web playback label must not be empty.',
          source: 'web-motion-playback-controller',
          metadata: {
            label
          }
        }
      ]
    };
  }

  private createUnknownJumpToLabelResult(label: string): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: 'web-playback-jump-to-label-unknown-label',
      diagnostics: [
        {
          level: 'warning',
          code: 'web-playback-jump-to-label-unknown-label',
          message: `Web playback label "${label}" does not exist.`,
          source: 'web-motion-playback-controller',
          metadata: {
            label
          }
        }
      ]
    };
  }

  private setAnimationsPlaybackRate(rate: number): MotionPlaybackResult {
    try {
      const signedPlaybackRate = this.resolveSignedPlaybackRate(rate);

      for (const animation of this.animations) {
        animation.playbackRate = signedPlaybackRate;
      }

      return {
        status: this.resolveSeekResultStatus(),
        reason: 'web-playback-set-playback-rate'
      };
    } catch (error) {
      return {
        status: 'failed',
        reason: 'web-playback-set-playback-rate-failed',
        error,
        diagnostics: [
          {
            level: 'error',
            code: 'web-playback-set-playback-rate-failed',
            message: 'Web playback rate could not be changed safely.',
            source: 'web-motion-playback-controller',
            metadata: {
              rate
            }
          }
        ]
      };
    }
  }

  private resolveSignedPlaybackRate(rate: number): number {
    return this.resolvePlaybackDirection() === 'backward' ? -rate : rate;
  }

  private createInvalidPlaybackRateResult(rate: number): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: 'web-playback-set-playback-rate-invalid-rate',
      diagnostics: [
        {
          level: 'warning',
          code: 'web-playback-set-playback-rate-invalid-rate',
          message: 'Web playback rate must be a finite number greater than 0.',
          source: 'web-motion-playback-controller',
          metadata: {
            rate
          }
        }
      ]
    };
  }

  private playAnimationsInDirection(direction: MotionPlaybackDirectionState): MotionPlaybackResult {
    try {
      const playbackRate = resolveDirectionalPlaybackRate(this.resolvePlaybackRate(), direction);

      for (const animation of this.animations) {
        animation.playbackRate = playbackRate;

        if (direction === 'backward') {
          this.prepareAnimationForBackwardPlayback(animation);
        }

        animation.play();
      }

      return {
        status: 'running',
        reason:
          direction === 'backward' ? 'web-playback-play-backward' : 'web-playback-play-forward'
      };
    } catch (error) {
      return {
        status: 'failed',
        reason:
          direction === 'backward'
            ? 'web-playback-play-backward-failed'
            : 'web-playback-play-forward-failed',
        error,
        diagnostics: [
          {
            level: 'error',
            code:
              direction === 'backward'
                ? 'web-playback-play-backward-failed'
                : 'web-playback-play-forward-failed',
            message:
              direction === 'backward'
                ? 'Web playback could not play backward safely.'
                : 'Web playback could not play forward safely.',
            source: 'web-motion-playback-controller',
            metadata: {
              direction
            }
          }
        ]
      };
    }
  }

  private prepareAnimationForBackwardPlayback(animation: Animation): void {
    const currentTime = normalizeNumberish(animation.currentTime);

    if (currentTime !== null && currentTime > 0) {
      return;
    }

    const effect = animation.effect;

    if (effect === null || effect === undefined) {
      return;
    }

    const endTime = normalizeNumberish(effect.getComputedTiming().endTime);

    if (endTime === null) {
      return;
    }

    animation.currentTime = endTime;
  }

  private applyDirectionalPlaybackResult(result: MotionPlaybackResult): void {
    const previousStatus = this.currentStatus;

    this.currentStatus = result.status;

    if (previousStatus !== this.currentStatus) {
      this.emitResult(result, previousStatus);
    }
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

function clampProgress(progress: number): number {
  return Math.min(Math.max(progress, 0), 1);
}

function resolveDirectionalPlaybackRate(
  currentPlaybackRate: number,
  direction: MotionPlaybackDirectionState
): number {
  const absolutePlaybackRate = Math.abs(currentPlaybackRate) || 1;

  return direction === 'backward' ? -absolutePlaybackRate : absolutePlaybackRate;
}

function uniqueNumbers(values: ReadonlyArray<number>): ReadonlyArray<number> {
  return Array.from(new Set(values));
}
