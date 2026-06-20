import {
  BaseMotionPlaybackController,
  isTerminalPlaybackStatus,
  type MotionPlaybackController,
  type MotionPlaybackControllerStatus,
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

    this.emit('start', this.currentStatus);

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

  async pause(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('pause');
    }

    if (this.currentStatus === 'paused') {
      return this.createInvalidTransitionResult('pause');
    }

    for (const animation of this.animations) {
      animation.pause();
    }

    const result: MotionPlaybackResult = {
      status: 'paused',
      reason: 'web-playback-pause'
    };

    this.currentStatus = result.status;

    this.emitResult(result);

    return result;
  }

  async resume(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('resume');
    }

    if (this.currentStatus !== 'paused') {
      return this.createInvalidTransitionResult('resume');
    }

    for (const animation of this.animations) {
      animation.play();
    }

    const result: MotionPlaybackResult = {
      status: 'running',
      reason: 'web-playback-resume'
    };

    this.currentStatus = result.status;

    this.emitResult(result);

    return result;
  }

  async cancel(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('cancel');
    }

    for (const animation of this.animations) {
      animation.cancel();
    }

    const result: MotionPlaybackResult = {
      status: 'cancelled',
      reason: 'web-playback-cancel'
    };

    this.currentStatus = result.status;

    this.emitResult(result);

    return result;
  }

  async finish(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('finish');
    }

    for (const animation of this.animations) {
      animation.finish();
    }

    const result: MotionPlaybackResult = {
      status: 'finished',
      reason: 'web-playback-finish'
    };

    this.currentStatus = result.status;

    this.emitResult(result);

    return result;
  }

  private applyFinishedResult(result: MotionPlaybackResult): void {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return;
    }

    this.currentStatus = result.status;

    this.emitResult(result);
  }

  private emitResult(result: MotionPlaybackResult): void {
    switch (result.status) {
      case 'finished':
        this.emit('finish', this.currentStatus, result);
        break;

      case 'cancelled':
        this.emit('cancel', this.currentStatus, result);
        break;

      case 'skipped':
        this.emit('skip', this.currentStatus, result);
        break;

      case 'failed':
        this.emit('fail', this.currentStatus, result);
        break;

      case 'paused':
        this.emit('pause', this.currentStatus, result);
        break;

      case 'running':
        this.emit('resume', this.currentStatus, result);
        break;
    }
  }

  private createInvalidTransitionResult(action: string): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: `web-playback-${action}-not-allowed-from-${this.currentStatus}`
    };
  }
}
