import {
  createMotionEngine,
  createMotionTimeline,
  type MotionPlaybackController,
  type MotionPlaybackEvent,
  type MotionPlaybackResult,
  type MotionTimelineDefinition
} from '@structifyx/motion-core';
import { WebMotionDriver } from '@structifyx/motion-web';
import './styles.css';

const target = getElementByIdOrThrow<HTMLElement>('motionTarget');
const timelineLog = getElementByIdOrThrow<HTMLElement>('timelineLog');
const resultLog = getElementByIdOrThrow<HTMLElement>('resultLog');
const eventsLog = getElementByIdOrThrow<HTMLOListElement>('eventsLog');
const controllerStatus = getElementByIdOrThrow<HTMLElement>('controllerStatus');

let currentPlayback: MotionPlaybackController | null = null;
let unsubscribePlaybackEvents: Array<() => void> = [];
const playbackEvents: string[] = [];

const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }),
  defaults: {
    duration: 900,
    easing: 'ease-in-out',
    fill: 'both'
  }
});

writeTimeline();
writeResult('ready', {
  status: 'finished',
  reason: 'infinite-yoyo-example-ready'
});
writeControllerStatus();

bindButton('playInfiniteButton', () => {
  void runPlayback('play infinite yoyo', async () => {
    disposeCurrentPlayback();

    return await motion.playTimeline(target, createInfiniteYoyoTimeline());
  });
});

bindButton('createControllerButton', () => {
  createController();
});

bindButton('pauseButton', () => {
  void runControllerAction('pause');
});

bindButton('resumeButton', () => {
  void runControllerAction('resume');
});

bindButton('finishButton', () => {
  void runControllerAction('finish');
});

bindButton('cancelButton', () => {
  void runControllerAction('cancel');
});

bindButton('resetButton', () => {
  void runPlayback('reset', async () => {
    disposeCurrentPlayback();

    const result = await motion.reset(target);
    target.removeAttribute('style');

    return result;
  });
});

function createInfiniteYoyoTimeline(): MotionTimelineDefinition {
  return createMotionTimeline((timeline) => {
    timeline.defaults({
      duration: 900,
      easing: 'ease-in-out',
      fill: 'both',
      iterations: 'infinite',
      yoyo: true
    });

    timeline.track('self', (track) => {
      track.step(
        {
          duration: 900,
          iterations: 'infinite',
          yoyo: true,
          easing: 'ease-in-out',
          fill: 'both'
        },
        (step) => {
          step.from({
            opacity: 0.75,
            transform: {
              x: -120,
              y: 0,
              scale: 0.92,
              rotate: -8
            },
            filter: {
              blur: 0
            },
            backgroundColor: '#f8fafc'
          });

          step.to({
            opacity: 1,
            transform: {
              x: 120,
              y: 0,
              scale: 1.08,
              rotate: 8
            },
            filter: {
              blur: 0
            },
            backgroundColor: '#ccfbf1'
          });
        }
      );
    });
  });
}

function createController(): void {
  disposeCurrentPlayback();

  const playback = motion.createTimelinePlayback(target, createInfiniteYoyoTimeline());

  currentPlayback = playback;
  playbackEvents.length = 0;

  attachPlaybackEvents(playback);

  writeResult('create controller', {
    status: playback.status === 'running' ? 'running' : 'finished',
    reason: playback.status
  });

  writeControllerStatus();

  void playback.finished.then((result) => {
    if (currentPlayback !== playback) {
      return;
    }

    writeResult('controller finished', result);
    writeControllerStatus();
  });
}

async function runControllerAction(
  action: 'pause' | 'resume' | 'finish' | 'cancel'
): Promise<void> {
  if (!currentPlayback) {
    writeResult(action, {
      status: 'skipped',
      reason: 'no-active-controller'
    });
    return;
  }

  if (currentPlayback.disposed) {
    writeResult(action, {
      status: 'skipped',
      reason: 'controller-disposed'
    });
    writeControllerStatus();
    return;
  }

  const result = await currentPlayback[action]();

  writeResult(`controller ${action}`, result);
  writeControllerStatus();
}

async function runPlayback(
  label: string,
  action: () => Promise<MotionPlaybackResult>
): Promise<void> {
  writeResult(label, {
    status: 'running',
    reason: 'action-started'
  });

  try {
    const result = await action();

    writeResult(label, result);
    writeControllerStatus();
  } catch (error) {
    writeResult(label, {
      status: 'failed',
      reason: 'example-error',
      error
    });
  }
}

function attachPlaybackEvents(playback: MotionPlaybackController): void {
  const eventTypes = [
    'start',
    'statusChange',
    'pause',
    'resume',
    'cancel',
    'finish',
    'skip',
    'fail'
  ] as const;

  for (const eventType of eventTypes) {
    unsubscribePlaybackEvents.push(
      playback.on(eventType, (event) => {
        pushPlaybackEvent(event);
      })
    );
  }
}

function pushPlaybackEvent(event: MotionPlaybackEvent): void {
  playbackEvents.unshift(
    `${new Date(event.timestamp).toLocaleTimeString()} | ${event.type} | ${
      event.previousStatus
    } -> ${event.status}${event.result?.reason ? ` | ${event.result.reason}` : ''}`
  );

  if (playbackEvents.length > 30) {
    playbackEvents.length = 30;
  }

  renderPlaybackEvents();
  writeControllerStatus();
}

function renderPlaybackEvents(): void {
  eventsLog.replaceChildren(
    ...playbackEvents.map((event) => {
      const item = document.createElement('li');
      item.textContent = event;
      return item;
    })
  );
}

function disposeCurrentPlayback(): void {
  for (const unsubscribe of unsubscribePlaybackEvents) {
    unsubscribe();
  }

  unsubscribePlaybackEvents = [];

  if (!currentPlayback) {
    writeControllerStatus();
    return;
  }

  currentPlayback.dispose();
  currentPlayback = null;
  writeControllerStatus();
}

function writeTimeline(): void {
  writeJson(timelineLog, createInfiniteYoyoTimeline());
}

function writeResult(label: string, result: unknown): void {
  writeJson(resultLog, {
    label,
    result,
    at: new Date().toISOString()
  });
}

function writeControllerStatus(): void {
  controllerStatus.textContent = currentPlayback
    ? `Controller: ${currentPlayback.status} | disposed: ${
        currentPlayback.disposed ? 'true' : 'false'
      }`
    : 'Controller: aucun';
}

function bindButton(id: string, listener: () => void): void {
  getElementByIdOrThrow<HTMLButtonElement>(id).addEventListener('click', listener);
}

function getElementByIdOrThrow<TElement extends HTMLElement>(id: string): TElement {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Element not found: ${id}`);
  }

  return element as TElement;
}

function writeJson(targetElement: HTMLElement, value: unknown): void {
  targetElement.textContent = JSON.stringify(value, createJsonReplacer(), 2);
}

function createJsonReplacer(): (key: string, value: unknown) => unknown {
  return (_key, value) => {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message
      };
    }

    return value;
  };
}
