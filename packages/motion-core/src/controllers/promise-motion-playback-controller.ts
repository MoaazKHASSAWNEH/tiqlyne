import type {
  MotionPlaybackController,
  MotionPlaybackControllerStatus
} from '../models/motion-playback-controller';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import { isTerminalPlaybackStatus } from '../utils/is-terminal-playback-status';
import { BaseMotionPlaybackController } from './base-motion-playback-controller';
import type { MotionPlaybackState } from '../models/motion-playback-state';

export class PromiseMotionPlaybackController
  extends BaseMotionPlaybackController
  implements MotionPlaybackController
{
  private currentStatus: MotionPlaybackControllerStatus = 'running';

  constructor(
    readonly id: string,
    readonly finished: Promise<MotionPlaybackResult>,
    private readonly cancelHandler: () => Promise<MotionPlaybackResult>,
    private readonly finishHandler: () => Promise<MotionPlaybackResult>
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
          reason: 'playback-finished-promise-rejected',
          error
        });
      });
  }

  get status(): MotionPlaybackControllerStatus {
    return this.currentStatus;
  }

  getState(): MotionPlaybackState {
    return {
      status: this.currentStatus,
      currentTime: null,
      duration: null,
      progress: null,
      playbackRate: 1,
      direction: 'forward',
      activeTrackIndexes: [],
      activeStepIndexes: []
    };
  }
  async pause(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('pause');
    }

    const result: MotionPlaybackResult = {
      status: 'skipped',
      reason: 'playback-pause-not-supported'
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

    const result: MotionPlaybackResult = {
      status: 'skipped',
      reason: 'playback-resume-not-supported'
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

    const result = await this.cancelHandler();

    const previousStatus = this.currentStatus;

    this.currentStatus = result.status;

    this.emitResult(result, previousStatus);

    return result;
  }

  async finish(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('finish');
    }

    const result = await this.finishHandler();

    const previousStatus = this.currentStatus;

    this.currentStatus = result.status;

    this.emitResult(result, previousStatus);

    return result;
  }

  private applyFinishedResult(result: MotionPlaybackResult): void {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return;
    }

    const previousStatus = this.currentStatus;

    this.currentStatus = result.status;

    this.emitResult(result, previousStatus);
  }

  private createInvalidTransitionResult(action: string): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: `playback-${action}-not-allowed-from-${this.currentStatus}`,
      diagnostics: [
        {
          level: 'warning',
          code: 'playback-invalid-transition',
          message: `Cannot run "${action}" while playback is "${this.currentStatus}".`,
          source: 'promise-motion-playback-controller',
          metadata: {
            action,
            currentStatus: this.currentStatus
          }
        }
      ]
    };
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
}
