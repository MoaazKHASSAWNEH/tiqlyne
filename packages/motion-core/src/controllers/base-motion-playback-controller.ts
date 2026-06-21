import type {
  MotionPlaybackEvent,
  MotionPlaybackEventListener,
  MotionPlaybackEventType
} from '../models/motion-playback-event';
import type { MotionPlaybackControllerStatus } from '../models/motion-playback-controller';
import type { MotionPlaybackResult } from '../models/motion-playback-result';

export abstract class BaseMotionPlaybackController {
  private readonly listeners = new Map<MotionPlaybackEventType, Set<MotionPlaybackEventListener>>();
  private isDisposed = false;

  abstract readonly id: string;
  abstract readonly status: MotionPlaybackControllerStatus;

  get disposed(): boolean {
    return this.isDisposed;
  }

  on(type: MotionPlaybackEventType, listener: MotionPlaybackEventListener): () => void {
    if (this.isDisposed) {
      return (): void => {};
    }

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

  once(type: MotionPlaybackEventType, listener: MotionPlaybackEventListener): () => void {
    let unsubscribe: () => void = (): void => {};

    unsubscribe = this.on(type, (event) => {
      unsubscribe();
      listener(event);
    });

    return unsubscribe;
  }

  dispose(): void {
    this.isDisposed = true;
    this.listeners.clear();
  }

  protected emit(
    type: MotionPlaybackEventType,
    status: MotionPlaybackControllerStatus,
    previousStatus: MotionPlaybackControllerStatus,
    result?: MotionPlaybackResult
  ): void {
    if (this.isDisposed) {
      return;
    }

    const listeners = this.listeners.get(type);

    if (!listeners) {
      return;
    }

    const event: MotionPlaybackEvent = {
      type,
      playbackId: this.id,
      status,
      previousStatus,
      ...(result !== undefined ? { result } : {})
    };

    for (const listener of listeners) {
      listener(event);
    }
  }

  protected emitStatusChange(
    type: Exclude<MotionPlaybackEventType, 'start' | 'statusChange'>,
    status: MotionPlaybackControllerStatus,
    previousStatus: MotionPlaybackControllerStatus,
    result: MotionPlaybackResult
  ): void {
    this.emit(type, status, previousStatus, result);
    this.emit('statusChange', status, previousStatus, result);
  }
}
