import {
  DefaultMotionConfigNormalizer,
  DefaultMotionEngine,
  DefaultMotionRegistry,
  type MotionConfig,
  type MotionPlaybackController,
  type MotionPlaybackResult,
  type ReducedMotionStrategy
} from '@structifyx/motion-core';
import { registerBasicMotions } from '@structifyx/motion-pack-basic';
import { WebMotionDriver } from '@structifyx/motion-web';
import './styles.css';

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

const driver = new WebMotionDriver({
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
});

const engine = new DefaultMotionEngine<Element>({
  registry,
  driver,
  normalizer: new DefaultMotionConfigNormalizer()
});

const target = getElementByIdOrThrow('motionTarget');
const log = getElementByIdOrThrow('log');

const reducedMotionStrategySelect = getElementByIdOrThrow(
  'reducedMotionStrategySelect'
) as HTMLSelectElement;

const reducedMotionStatus = getElementByIdOrThrow('reducedMotionStatus');
const playbackStatus = getElementByIdOrThrow('playbackStatus');

const fadeInButton = getElementByIdOrThrow('fadeInButton');
const fadeOutButton = getElementByIdOrThrow('fadeOutButton');
const slideInButton = getElementByIdOrThrow('slideInButton');
const resetButton = getElementByIdOrThrow('resetButton');

const createPlaybackButton = getElementByIdOrThrow('createPlaybackButton');
const pausePlaybackButton = getElementByIdOrThrow('pausePlaybackButton');
const resumePlaybackButton = getElementByIdOrThrow('resumePlaybackButton');
const finishPlaybackButton = getElementByIdOrThrow('finishPlaybackButton');
const cancelPlaybackButton = getElementByIdOrThrow('cancelPlaybackButton');
const disposePlaybackButton = getElementByIdOrThrow('disposePlaybackButton');

let currentPlayback: MotionPlaybackController | null = null;
const playbackEvents: string[] = [];

writeReducedMotionStatus();
writePlaybackStatus();

fadeInButton.addEventListener('click', () => {
  void playMotion({
    id: 'example_fade_in',
    type: 'fade-in',
    trigger: 'onClick',
    duration: 450,
    easing: 'ease-out',
    respectReducedMotion: true,
    reducedMotionStrategy: getReducedMotionStrategy(),
    options: {
      fromOpacity: 0,
      toOpacity: 1
    }
  });
});

fadeOutButton.addEventListener('click', () => {
  void playMotion({
    id: 'example_fade_out',
    type: 'fade-out',
    trigger: 'onClick',
    duration: 350,
    easing: 'ease-in',
    respectReducedMotion: true,
    reducedMotionStrategy: getReducedMotionStrategy(),
    options: {
      fromOpacity: 1,
      toOpacity: 0
    }
  });
});

slideInButton.addEventListener('click', () => {
  void playMotion({
    id: 'example_slide_in',
    type: 'slide-in',
    trigger: 'onClick',
    duration: 500,
    easing: {
      type: 'cubicBezier',
      x1: 0.22,
      y1: 1,
      x2: 0.36,
      y2: 1
    },
    respectReducedMotion: true,
    reducedMotionStrategy: getReducedMotionStrategy(),
    options: {
      direction: 'bottom',
      distance: 56,
      fade: true
    }
  });
});

resetButton.addEventListener('click', () => {
  void resetMotion();
});

createPlaybackButton.addEventListener('click', () => {
  createPlayback();
});

pausePlaybackButton.addEventListener('click', () => {
  void runPlaybackAction('pause');
});

resumePlaybackButton.addEventListener('click', () => {
  void runPlaybackAction('resume');
});

finishPlaybackButton.addEventListener('click', () => {
  void runPlaybackAction('finish');
});

cancelPlaybackButton.addEventListener('click', () => {
  void runPlaybackAction('cancel');
});

disposePlaybackButton.addEventListener('click', () => {
  disposeCurrentPlayback();
});

async function resetMotion(): Promise<void> {
  disposeCurrentPlayback();

  const result = await engine.reset(target);

  writeLog({
    action: 'reset',
    result
  });

  writePlaybackStatus();
}

async function playMotion(config: MotionConfig): Promise<void> {
  disposeCurrentPlayback();

  writeLog({
    action: 'play',
    message: `Playing ${config.type}`,
    config
  });

  const result = await engine.play(target, config);

  writeLog({
    action: 'play:finished',
    result
  });

  writePlaybackStatus();
}

function createPlayback(): void {
  disposeCurrentPlayback();

  playbackEvents.length = 0;

  const playback = engine.createPlayback(target, {
    id: 'example_controlled_slide_in',
    type: 'slide-in',
    trigger: 'manual',
    duration: 1600,
    easing: {
      type: 'cubicBezier',
      x1: 0.22,
      y1: 1,
      x2: 0.36,
      y2: 1
    },
    respectReducedMotion: true,
    reducedMotionStrategy: getReducedMotionStrategy(),
    options: {
      direction: 'bottom',
      distance: 72,
      fade: true
    }
  });

  currentPlayback = playback;

  attachPlaybackListeners(playback);
  writePlaybackStatus();

  writeLog({
    action: 'createPlayback',
    playback: createPlaybackSnapshot(playback),
    events: playbackEvents
  });

  void playback.finished.then((result) => {
    if (currentPlayback !== playback) {
      return;
    }

    writeLog({
      action: 'playback.finished',
      playback: createPlaybackSnapshot(playback),
      events: playbackEvents,
      result
    });

    writePlaybackStatus();
  });
}

function attachPlaybackListeners(playback: MotionPlaybackController): void {
  playback.on('pause', (event) => {
    pushPlaybackEvent(formatPlaybackEvent(event));
    writePlaybackEventLog(playback);
  });

  playback.on('resume', (event) => {
    pushPlaybackEvent(formatPlaybackEvent(event));
    writePlaybackEventLog(playback);
  });

  playback.on('cancel', (event) => {
    pushPlaybackEvent(formatPlaybackEvent(event));
    writePlaybackEventLog(playback);
  });

  playback.on('finish', (event) => {
    pushPlaybackEvent(formatPlaybackEvent(event));
    writePlaybackEventLog(playback);
  });

  playback.on('skip', (event) => {
    pushPlaybackEvent(formatPlaybackEvent(event));
    writePlaybackEventLog(playback);
  });

  playback.on('fail', (event) => {
    pushPlaybackEvent(formatPlaybackEvent(event));
    writePlaybackEventLog(playback);
  });

  playback.on('statusChange', (event) => {
    pushPlaybackEvent(formatPlaybackEvent(event));
    writePlaybackEventLog(playback);
  });

  playback.once('finish', (event) => {
    pushPlaybackEvent(`once:${formatPlaybackEvent(event)}`);
    writePlaybackEventLog(playback);
  });
}

async function runPlaybackAction(action: 'pause' | 'resume' | 'finish' | 'cancel'): Promise<void> {
  const playback = currentPlayback;

  if (!playback) {
    writeLog({
      action,
      message: 'No playback controller. Click "Create Playback" first.'
    });

    return;
  }

  if (playback.disposed) {
    writeLog({
      action,
      message: 'Playback controller is disposed. Create a new playback first.',
      playback: createPlaybackSnapshot(playback)
    });

    return;
  }

  const result = await playback[action]();

  writeLog({
    action,
    playback: createPlaybackSnapshot(playback),
    events: playbackEvents,
    result
  });

  writePlaybackStatus();
}

function disposeCurrentPlayback(): void {
  if (!currentPlayback) {
    writePlaybackStatus();
    return;
  }

  const playback = currentPlayback;

  playback.dispose();

  writeLog({
    action: 'dispose',
    playback: createPlaybackSnapshot(playback),
    events: playbackEvents
  });

  writePlaybackStatus();
}

function pushPlaybackEvent(event: string): void {
  playbackEvents.push(event);
  writePlaybackStatus();
}

function writePlaybackEventLog(playback: MotionPlaybackController): void {
  writeLog({
    action: 'playback:event',
    playback: createPlaybackSnapshot(playback),
    events: playbackEvents
  });
}

function createPlaybackSnapshot(playback: MotionPlaybackController): {
  readonly id: string;
  readonly status: string;
  readonly disposed: boolean;
} {
  return {
    id: playback.id,
    status: playback.status,
    disposed: playback.disposed
  };
}

function writeLog(value: unknown): void {
  log.textContent = JSON.stringify(value, null, 2);
}

function writePlaybackStatus(): void {
  if (!currentPlayback) {
    playbackStatus.textContent = 'Aucun playback controller actif.';
    return;
  }

  playbackStatus.textContent = `Playback status: ${currentPlayback.status} | disposed: ${
    currentPlayback.disposed ? 'true' : 'false'
  }`;
}

function getReducedMotionStrategy(): ReducedMotionStrategy {
  const value = reducedMotionStrategySelect.value;

  if (value === 'preserve' || value === 'simplify' || value === 'skip') {
    return value;
  }

  return 'skip';
}

function writeReducedMotionStatus(): void {
  const reducedMotionEnabled = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  reducedMotionStatus.textContent = `prefers-reduced-motion: ${
    reducedMotionEnabled ? 'reduce' : 'no-preference'
  }`;
}

function getElementByIdOrThrow(id: string): HTMLElement {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Element not found: ${id}`);
  }

  return element;
}

function formatPlaybackEvent(event: {
  readonly type: string;
  readonly previousStatus: string;
  readonly status: string;
  readonly timestamp: number;
}): string {
  return `${event.type}:${event.previousStatus}->${event.status} @ ${new Date(
    event.timestamp
  ).toLocaleTimeString()}`;
}
