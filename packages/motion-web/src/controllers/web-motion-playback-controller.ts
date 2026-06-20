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
        this.currentStatus = result.status;
      })
      .catch(() => {
        this.currentStatus = 'failed';
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

    this.emit('pause', this.currentStatus, result);

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

    this.emit('resume', this.currentStatus, result);

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

    this.emit('cancel', this.currentStatus, result);

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

    this.emit('finish', this.currentStatus, result);

    return result;
  }

  private createInvalidTransitionResult(action: string): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: `web-playback-${action}-not-allowed-from-${this.currentStatus}`
    };
  }
}
