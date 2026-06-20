import type {
  MotionPlaybackController,
  MotionPlaybackControllerStatus,
  MotionPlaybackResult
} from '@structifyx/motion-core';

export class WebMotionPlaybackController implements MotionPlaybackController {
  private currentStatus: MotionPlaybackControllerStatus = 'running';

  constructor(
    readonly id: string,
    private readonly animations: ReadonlyArray<Animation>,
    readonly finished: Promise<MotionPlaybackResult>
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
    for (const animation of this.animations) {
      animation.pause();
    }

    const result: MotionPlaybackResult = {
      status: 'paused',
      reason: 'web-playback-pause'
    };

    this.currentStatus = result.status;

    return result;
  }

  async resume(): Promise<MotionPlaybackResult> {
    for (const animation of this.animations) {
      animation.play();
    }

    const result: MotionPlaybackResult = {
      status: 'running',
      reason: 'web-playback-resume'
    };

    this.currentStatus = result.status;

    return result;
  }

  async cancel(): Promise<MotionPlaybackResult> {
    for (const animation of this.animations) {
      animation.cancel();
    }

    const result: MotionPlaybackResult = {
      status: 'cancelled',
      reason: 'web-playback-cancel'
    };

    this.currentStatus = result.status;

    return result;
  }

  async finish(): Promise<MotionPlaybackResult> {
    for (const animation of this.animations) {
      animation.finish();
    }

    const result: MotionPlaybackResult = {
      status: 'finished',
      reason: 'web-playback-finish'
    };

    this.currentStatus = result.status;

    return result;
  }
}
