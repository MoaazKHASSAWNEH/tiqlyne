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

    for (const animation of this.animations) {
      animation.play();
    }

    const result: MotionPlaybackResult = {
      status: 'running',
      reason: 'web-playback-resume'
    };

    const previousStatus = this.currentStatus;
    this.currentStatus = result.status;

    this.emitResult(result, previousStatus);

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

    const previousStatus = this.currentStatus;
    this.currentStatus = result.status;

    this.emitResult(result, previousStatus);

    return result;
  }

  async finish(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('finish');
    }

    const result = this.finishAnimations();

    const previousStatus = this.currentStatus;
    this.currentStatus = result.status;

    this.emitResult(result, previousStatus);

    return result;
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
