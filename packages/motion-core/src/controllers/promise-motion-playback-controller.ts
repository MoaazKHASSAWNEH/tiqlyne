import type {
  MotionPlaybackController,
  MotionPlaybackControllerStatus
} from '../models/motion-playback-controller';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import { isTerminalPlaybackStatus } from '../utils/is-terminal-playback-status';
import { BaseMotionPlaybackController } from './base-motion-playback-controller';

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

    this.emit('start', this.currentStatus);

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

  async pause(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('pause');
    }

    const result: MotionPlaybackResult = {
      status: 'skipped',
      reason: 'playback-pause-not-supported'
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

    const result: MotionPlaybackResult = {
      status: 'skipped',
      reason: 'playback-resume-not-supported'
    };

    this.currentStatus = result.status;

    this.emitResult(result);

    return result;
  }

  async cancel(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('cancel');
    }

    const result = await this.cancelHandler();

    this.currentStatus = result.status;

    this.emitResult(result);

    return result;
  }

  async finish(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('finish');
    }

    const result = await this.finishHandler();

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

  private createInvalidTransitionResult(action: string): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: `playback-${action}-not-allowed-from-${this.currentStatus}`
    };
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
}
