import type {
  MotionPlaybackController,
  MotionPlaybackControllerStatus
} from '../models/motion-playback-controller';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import { isTerminalPlaybackStatus } from '../utils/is-terminal-playback-status';

export class PromiseMotionPlaybackController implements MotionPlaybackController {
  private currentStatus: MotionPlaybackControllerStatus = 'running';

  constructor(
    readonly id: string,
    readonly finished: Promise<MotionPlaybackResult>,
    private readonly cancelHandler: () => Promise<MotionPlaybackResult>,
    private readonly finishHandler: () => Promise<MotionPlaybackResult>
  ) {
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

    const result: MotionPlaybackResult = {
      status: 'skipped',
      reason: 'playback-pause-not-supported'
    };

    this.currentStatus = result.status;

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

    return result;
  }

  async cancel(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('cancel');
    }

    const result = await this.cancelHandler();

    this.currentStatus = result.status;

    return result;
  }

  async finish(): Promise<MotionPlaybackResult> {
    if (isTerminalPlaybackStatus(this.currentStatus)) {
      return this.createInvalidTransitionResult('finish');
    }

    const result = await this.finishHandler();

    this.currentStatus = result.status;

    return result;
  }

  private createInvalidTransitionResult(action: string): MotionPlaybackResult {
    return {
      status: 'skipped',
      reason: `playback-${action}-not-allowed-from-${this.currentStatus}`
    };
  }
}
