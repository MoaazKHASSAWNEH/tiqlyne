import type {
  MotionPlaybackEvent,
  MotionPlaybackEventListener,
  MotionPlaybackEventType
} from '../models/motion-playback-event';
import type { MotionPlaybackControllerStatus } from '../models/motion-playback-controller';
import type { MotionPlaybackResult } from '../models/motion-playback-result';

export abstract class BaseMotionPlaybackController {
  private readonly listeners = new Map<MotionPlaybackEventType, Set<MotionPlaybackEventListener>>();

  abstract readonly id: string;
  abstract readonly status: MotionPlaybackControllerStatus;

  on(type: MotionPlaybackEventType, listener: MotionPlaybackEventListener): () => void {
    const listeners = this.listeners.get(type) ?? new Set<MotionPlaybackEventListener>();

    listeners.add(listener);
    this.listeners.set(type, listeners);

    return () => {
      listeners.delete(listener);

      if (listeners.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  protected emit(
    type: MotionPlaybackEventType,
    status: MotionPlaybackControllerStatus,
    result?: MotionPlaybackResult
  ): void {
    const listeners = this.listeners.get(type);

    if (!listeners) {
      return;
    }

    const event: MotionPlaybackEvent = {
      type,
      playbackId: this.id,
      status,
      ...(result !== undefined ? { result } : {})
    };

    for (const listener of listeners) {
      listener(event);
    }
  }
}
