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
