import { MotionDiagnosticCodes } from '../diagnostics/motion-diagnostic-code';
import {
  createPlaybackInvalidInputDiagnostic,
  createPlaybackInvalidTransitionDiagnostic,
  createPlaybackUnsupportedDiagnostic
} from '../diagnostics/create-playback-diagnostic';
import { MotionDiagnosticSources } from '../diagnostics/motion-diagnostic-source';
import type {
  MotionPlaybackController,
  MotionPlaybackControllerStatus
} from '../models/motion-playback-controller';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { MotionPlaybackState } from '../models/motion-playback-state';
import { isTerminalPlaybackStatus } from '../utils/is-terminal-playback-status';
import { BaseMotionPlaybackController } from './base-motion-playback-controller';

export class PromiseMotionPlaybackController
  extends BaseMotionPlaybackController
  implements MotionPlaybackController
{
  private readonly diagnosticSource = MotionDiagnosticSources.PromisePlaybackController;

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

  async seek(time: number): Promise<MotionPlaybackResult> {
    if (!Number.isFinite(time)) {
      return {
        status: 'skipped',
        reason: 'playback-seek-invalid-time',
        diagnostics: [
          createPlaybackInvalidInputDiagnostic(
            MotionDiagnosticCodes.PlaybackSeekInvalidTime,
            'Playback seek time must be a finite number.',
            this.diagnosticSource,
            {
              time
            }
          )
        ]
      };
    }

    return {
      status: 'skipped',
      reason: 'playback-seek-not-supported',
      diagnostics: [
        createPlaybackUnsupportedDiagnostic(
          MotionDiagnosticCodes.PlaybackSeekNotSupported,
          'This playback controller does not support seek(time).',
          this.diagnosticSource,
          {
            time
          }
        )
      ]
    };
  }

  async seekProgress(progress: number): Promise<MotionPlaybackResult> {
    if (!Number.isFinite(progress)) {
      return {
        status: 'skipped',
        reason: 'playback-seek-progress-invalid-progress',
        diagnostics: [
          createPlaybackInvalidInputDiagnostic(
            MotionDiagnosticCodes.PlaybackSeekProgressInvalidProgress,
            'Playback seek progress must be a finite number.',
            this.diagnosticSource,
            {
              progress
            }
          )
        ]
      };
    }

    return {
      status: 'skipped',
      reason: 'playback-seek-progress-not-supported',
      diagnostics: [
        createPlaybackUnsupportedDiagnostic(
          MotionDiagnosticCodes.PlaybackSeekProgressNotSupported,
          'This playback controller does not support seekProgress(progress).',
          this.diagnosticSource,
          {
            progress
          }
        )
      ]
    };
  }

  async jumpToLabel(label: string): Promise<MotionPlaybackResult> {
    if (label.trim().length === 0) {
      return {
        status: 'skipped',
        reason: 'playback-jump-to-label-invalid-label',
        diagnostics: [
          createPlaybackInvalidInputDiagnostic(
            MotionDiagnosticCodes.PlaybackJumpToLabelInvalidLabel,
            'Playback label must not be empty.',
            this.diagnosticSource,
            {
              label
            }
          )
        ]
      };
    }

    return {
      status: 'skipped',
      reason: 'playback-jump-to-label-not-supported',
      diagnostics: [
        createPlaybackUnsupportedDiagnostic(
          MotionDiagnosticCodes.PlaybackJumpToLabelNotSupported,
          'This playback controller does not support jumpToLabel(label).',
          this.diagnosticSource,
          {
            label
          }
        )
      ]
    };
  }

  async playForward(): Promise<MotionPlaybackResult> {
    return {
      status: 'skipped',
      reason: 'playback-play-forward-not-supported',
      diagnostics: [
        createPlaybackUnsupportedDiagnostic(
          MotionDiagnosticCodes.PlaybackPlayForwardNotSupported,
          'This playback controller does not support playForward().',
          this.diagnosticSource
        )
      ]
    };
  }

  async playBackward(): Promise<MotionPlaybackResult> {
    return {
      status: 'skipped',
      reason: 'playback-play-backward-not-supported',
      diagnostics: [
        createPlaybackUnsupportedDiagnostic(
          MotionDiagnosticCodes.PlaybackPlayBackwardNotSupported,
          'This playback controller does not support playBackward().',
          this.diagnosticSource
        )
      ]
    };
  }

  async setPlaybackRate(rate: number): Promise<MotionPlaybackResult> {
    if (!Number.isFinite(rate) || rate <= 0) {
      return {
        status: 'skipped',
        reason: 'playback-set-playback-rate-invalid-rate',
        diagnostics: [
          createPlaybackInvalidInputDiagnostic(
            MotionDiagnosticCodes.PlaybackSetPlaybackRateInvalidRate,
            'Playback rate must be a finite number greater than 0.',
            this.diagnosticSource,
            {
              rate
            }
          )
        ]
      };
    }

    return {
      status: 'skipped',
      reason: 'playback-set-playback-rate-not-supported',
      diagnostics: [
        createPlaybackUnsupportedDiagnostic(
          MotionDiagnosticCodes.PlaybackSetPlaybackRateNotSupported,
          'This playback controller does not support setPlaybackRate(rate).',
          this.diagnosticSource,
          {
            rate
          }
        )
      ]
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
        createPlaybackInvalidTransitionDiagnostic(action, this.currentStatus, this.diagnosticSource)
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
