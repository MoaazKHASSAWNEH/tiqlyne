import {
  createMotionExecutionPlan,
  type MotionPlayOptions,
  type MotionTimelineDefinition
} from '@structifyx/motion-core';
import { describe, expect, it, vi } from 'vitest';
import { WebMotionDriver } from './web-motion-driver';

const defaultPlayOptions = {
  trigger: 'onClick',
  respectReducedMotion: true,
  reducedMotionStrategy: 'skip',
  conflictStrategy: 'replace'
} satisfies MotionPlayOptions;

describe('WebMotionDriver', () => {
  it('plays a timeline by calling element.animate', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const result = await driver.play(asElement(target), createSelfTimeline(), defaultPlayOptions);

    expect(result).toEqual({
      status: 'finished'
    });

    expect(target.animate).toHaveBeenCalledTimes(1);
    expect(target.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ],
      {
        duration: 250,
        delay: 0,
        easing: 'ease',
        fill: 'both'
      }
    );
  });

  it('skips playback when reduced motion is enabled', async () => {
    const driver = new WebMotionDriver({
      reducedMotion: true
    });

    const target = new FakeElement();

    const result = await driver.play(asElement(target), createSelfTimeline(), defaultPlayOptions);

    expect(result).toEqual({
      status: 'skipped',
      reason: 'reduced-motion'
    });

    expect(target.animate).not.toHaveBeenCalled();
  });

  it('preserves playback when reduced motion is enabled and strategy is preserve', async () => {
    const driver = new WebMotionDriver({
      reducedMotion: true
    });

    const target = new FakeElement();

    const result = await driver.play(asElement(target), createSelfTimeline(), {
      trigger: 'onClick',
      respectReducedMotion: true,
      reducedMotionStrategy: 'preserve',
      conflictStrategy: 'replace'
    });

    expect(result).toEqual({
      status: 'finished'
    });

    expect(target.animate).toHaveBeenCalledTimes(1);
  });

  it('simplifies playback when reduced motion is enabled and strategy is simplify', async () => {
    const driver = new WebMotionDriver({
      reducedMotion: true
    });

    const target = new FakeElement();

    const result = await driver.play(asElement(target), createSelfTimeline(), {
      trigger: 'onClick',
      respectReducedMotion: true,
      reducedMotionStrategy: 'simplify',
      conflictStrategy: 'replace'
    });

    expect(result).toEqual({
      status: 'finished',
      diagnostics: [
        {
          level: 'warning',
          code: 'reduced-motion-fallback-used',
          message:
            'Generic reduced motion fallback was used because no motion-specific reduced timeline was provided.',
          source: 'web',
          metadata: {
            strategy: 'simplify'
          }
        }
      ]
    });

    expect(target.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ],
      {
        duration: 150,
        delay: 0,
        easing: 'ease-out',
        fill: 'both'
      }
    );
  });

  it('uses the provided reduced motion timeline when simplifying playback', async () => {
    const driver = new WebMotionDriver({
      reducedMotion: true
    });

    const target = new FakeElement();

    const result = await driver.play(asElement(target), createSelfTimeline(), {
      trigger: 'onClick',
      respectReducedMotion: true,
      reducedMotionStrategy: 'simplify',
      reducedMotionTimeline: createReducedTimeline(),
      conflictStrategy: 'replace'
    });

    expect(result).toEqual({
      status: 'finished'
    });

    expect(target.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 0.4
        },
        {
          opacity: 1
        }
      ],
      {
        duration: 80,
        delay: 0,
        easing: 'linear',
        fill: 'both'
      }
    );
  });

  it('uses execution plan timeline when provided', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const originalTimeline = createSelfTimeline();
    const planTimeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 90,
              delay: 10,
              easing: 'linear',
              fill: 'both',
              keyframes: [
                {
                  opacity: 0.2
                },
                {
                  opacity: 0.9
                }
              ]
            }
          ]
        }
      ]
    };

    const executionPlan = createMotionExecutionPlan({
      timeline: planTimeline
    });

    const result = await driver.play(asElement(target), originalTimeline, {
      ...defaultPlayOptions,
      executionPlan,
      timelineValidated: true
    });

    expect(result).toEqual({
      status: 'finished'
    });

    expect(target.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 0.2
        },
        {
          opacity: 0.9
        }
      ],
      {
        duration: 90,
        delay: 10,
        easing: 'linear',
        fill: 'both'
      }
    );
  });

  it('uses scheduled task start time when execution plan is provided', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 100,
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 0.5
                }
              ]
            },
            {
              duration: 200,
              delay: 50,
              easing: 'linear',
              fill: 'both',
              keyframes: [
                {
                  opacity: 0.5
                },
                {
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    };

    const executionPlan = createMotionExecutionPlan({
      timeline
    });

    const result = await driver.play(asElement(target), timeline, {
      ...defaultPlayOptions,
      executionPlan,
      timelineValidated: true
    });

    expect(result).toEqual({
      status: 'finished'
    });

    expect(target.animate).toHaveBeenCalledTimes(2);

    expect(target.animate).toHaveBeenNthCalledWith(
      1,
      [
        {
          opacity: 0
        },
        {
          opacity: 0.5
        }
      ],
      {
        duration: 100,
        delay: 0,
        easing: 'ease',
        fill: 'both'
      }
    );

    expect(target.animate).toHaveBeenNthCalledWith(
      2,
      [
        {
          opacity: 0.5
        },
        {
          opacity: 1
        }
      ],
      {
        duration: 200,
        delay: 150,
        easing: 'linear',
        fill: 'both'
      }
    );
  });

  it('applies track stagger to multiple selector targets when execution plan is provided', async () => {
    const driver = new WebMotionDriver();
    const root = new FakeElement();
    const first = new FakeElement();
    const second = new FakeElement();
    const third = new FakeElement();

    root.setQueryAllResult('.item', [asElement(first), asElement(second), asElement(third)]);

    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'selector',
            selector: '.item'
          },
          stagger: 80,
          steps: [
            {
              duration: 100,
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    };

    const executionPlan = createMotionExecutionPlan({
      timeline
    });

    const result = await driver.play(asElement(root), timeline, {
      ...defaultPlayOptions,
      executionPlan,
      timelineValidated: true
    });

    expect(result).toEqual({
      status: 'finished'
    });

    expect(first.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ],
      {
        duration: 100,
        delay: 0,
        easing: 'ease',
        fill: 'both'
      }
    );

    expect(second.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ],
      {
        duration: 100,
        delay: 80,
        easing: 'ease',
        fill: 'both'
      }
    );

    expect(third.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ],
      {
        duration: 100,
        delay: 160,
        easing: 'ease',
        fill: 'both'
      }
    );
  });

  it('uses execution plan reduced motion timeline when simplifying playback', async () => {
    const driver = new WebMotionDriver({
      reducedMotion: true
    });

    const target = new FakeElement();

    const timeline = createSelfTimeline();
    const reducedMotionTimeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 60,
              delay: 0,
              easing: 'ease-out',
              fill: 'both',
              keyframes: [
                {
                  opacity: 0.3
                },
                {
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    };

    const executionPlan = createMotionExecutionPlan({
      timeline,
      reducedMotionTimeline
    });

    const result = await driver.play(asElement(target), timeline, {
      ...defaultPlayOptions,
      reducedMotionStrategy: 'simplify',
      executionPlan,
      timelineValidated: true,
      reducedMotionTimelineValidated: true
    });

    expect(result).toEqual({
      status: 'finished'
    });

    expect(target.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 0.3
        },
        {
          opacity: 1
        }
      ],
      {
        duration: 60,
        delay: 0,
        easing: 'ease-out',
        fill: 'both'
      }
    );
  });

  it('does not skip playback when reduced motion is disabled', async () => {
    const driver = new WebMotionDriver({
      reducedMotion: false
    });

    const target = new FakeElement();

    const result = await driver.play(asElement(target), createSelfTimeline(), defaultPlayOptions);

    expect(result).toEqual({
      status: 'finished'
    });

    expect(target.animate).toHaveBeenCalledTimes(1);
  });

  it('returns failed when a child target cannot be found', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const result = await driver.play(
      asElement(target),
      createChildTimeline('icon'),
      defaultPlayOptions
    );

    expect(result).toEqual({
      status: 'failed',
      reason: 'target-not-found'
    });
  });

  it('plays animation on a child target', async () => {
    const driver = new WebMotionDriver();
    const root = new FakeElement();
    const child = new FakeElement();

    root.setQueryResult('[data-motion-child="icon"]', asElement(child));

    const result = await driver.play(
      asElement(root),
      createChildTimeline('icon'),
      defaultPlayOptions
    );

    expect(result).toEqual({
      status: 'finished'
    });

    expect(root.animate).not.toHaveBeenCalled();
    expect(child.animate).toHaveBeenCalledTimes(1);
  });

  it('cancels animations on a target subtree', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const animation = createAnimationMock();

    target.setAnimations([animation]);

    const result = await driver.cancel(asElement(target));

    expect(result).toEqual({
      status: 'cancelled',
      reason: 'web-driver-cancel'
    });

    expect(target.getAnimations).toHaveBeenCalledWith({
      subtree: true
    });

    expect(animation.cancel).toHaveBeenCalledTimes(1);
  });

  it('finishes animations on a target subtree', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const animation = createAnimationMock();

    target.setAnimations([animation]);

    const result = await driver.finish(asElement(target));

    expect(result).toEqual({
      status: 'finished',
      reason: 'web-driver-finish'
    });

    expect(target.getAnimations).toHaveBeenCalledWith({
      subtree: true
    });

    expect(animation.finish).toHaveBeenCalledTimes(1);
  });

  it('resets a target by cancelling animations and removing inline styles', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const animation = createAnimationMock();

    target.setAnimations([animation]);

    const result = await driver.reset(asElement(target));

    expect(result).toEqual({
      status: 'finished',
      reason: 'web-driver-reset'
    });

    expect(animation.cancel).toHaveBeenCalledTimes(1);
    expect(target.removeAttribute).toHaveBeenCalledWith('style');
  });

  it('cancels previous animations before playing a new animation by default', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const previousAnimation = createAnimationMock();

    target.setAnimations([previousAnimation]);

    const result = await driver.play(asElement(target), createSelfTimeline(), defaultPlayOptions);

    expect(result).toEqual({
      status: 'finished'
    });

    expect(previousAnimation.cancel).toHaveBeenCalledTimes(1);
    expect(target.animate).toHaveBeenCalledTimes(1);
  });

  it('does not cancel previous animations when cancelPreviousAnimations is false', async () => {
    const driver = new WebMotionDriver({
      cancelPreviousAnimations: false
    });

    const target = new FakeElement();
    const previousAnimation = createAnimationMock();

    target.setAnimations([previousAnimation]);

    const result = await driver.play(asElement(target), createSelfTimeline(), defaultPlayOptions);

    expect(result).toEqual({
      status: 'finished'
    });

    expect(previousAnimation.cancel).not.toHaveBeenCalled();
    expect(target.animate).toHaveBeenCalledTimes(1);
  });

  it('does not cancel active animations when conflict strategy is parallel', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const previousAnimation = createAnimationMock('running');

    target.setAnimations([previousAnimation]);

    const result = await driver.play(asElement(target), createSelfTimeline(), {
      trigger: 'onClick',
      respectReducedMotion: true,
      reducedMotionStrategy: 'preserve',
      conflictStrategy: 'parallel'
    });

    expect(result).toEqual({
      status: 'finished'
    });

    expect(previousAnimation.cancel).not.toHaveBeenCalled();
    expect(target.animate).toHaveBeenCalledTimes(1);
  });

  it('skips playback when conflict strategy is ignore and an animation is active', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    target.setActiveAnimation();

    const result = await driver.play(asElement(target), createSelfTimeline(), {
      trigger: 'onClick',
      respectReducedMotion: true,
      reducedMotionStrategy: 'preserve',
      conflictStrategy: 'ignore'
    });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'motion-conflict-ignored'
    });

    expect(target.animate).not.toHaveBeenCalled();
  });

  it('creates a native playback controller', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    expect(playback.id).toBeTruthy();
    expect(playback.status).toBe('running');
    expect(target.animate).toHaveBeenCalledTimes(1);

    await expect(playback.finished).resolves.toEqual({
      status: 'finished'
    });

    expect(playback.status).toBe('finished');
  });

  it('cancels only animations created by the native playback controller', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const previousAnimation = createAnimationMock('running');

    target.setAnimations([previousAnimation]);

    const playback = driver.createPlayback(asElement(target), createSelfTimeline(), {
      trigger: 'onClick',
      respectReducedMotion: true,
      reducedMotionStrategy: 'preserve',
      conflictStrategy: 'parallel'
    });

    const createdAnimation = target.getLastAnimation();

    const result = await playback.cancel();

    expect(result).toEqual({
      status: 'cancelled',
      reason: 'web-playback-cancel'
    });

    expect(playback.status).toBe('cancelled');
    expect(previousAnimation.cancel).not.toHaveBeenCalled();
    expect(createdAnimation.cancel).toHaveBeenCalledTimes(1);
  });

  it('finishes only animations created by the native playback controller', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const previousAnimation = createAnimationMock('running');

    target.setAnimations([previousAnimation]);

    const playback = driver.createPlayback(asElement(target), createSelfTimeline(), {
      trigger: 'onClick',
      respectReducedMotion: true,
      reducedMotionStrategy: 'preserve',
      conflictStrategy: 'parallel'
    });

    const createdAnimation = target.getLastAnimation();

    const result = await playback.finish();

    expect(result).toEqual({
      status: 'finished',
      reason: 'web-playback-finish'
    });

    expect(playback.status).toBe('finished');
    expect(previousAnimation.finish).not.toHaveBeenCalled();
    expect(createdAnimation.finish).toHaveBeenCalledTimes(1);
  });

  it('pauses only animations created by the native playback controller', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const previousAnimation = createAnimationMock('running');

    target.setAnimations([previousAnimation]);

    const playback = driver.createPlayback(asElement(target), createSelfTimeline(), {
      trigger: 'onClick',
      respectReducedMotion: true,
      reducedMotionStrategy: 'preserve',
      conflictStrategy: 'parallel'
    });

    const createdAnimation = target.getLastAnimation();

    const result = await playback.pause();

    expect(result).toEqual({
      status: 'paused',
      reason: 'web-playback-pause'
    });

    expect(playback.status).toBe('paused');
    expect(previousAnimation.pause).not.toHaveBeenCalled();
    expect(createdAnimation.pause).toHaveBeenCalledTimes(1);
  });

  it('resumes only animations created by the native playback controller', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const previousAnimation = createAnimationMock('paused');

    target.setAnimations([previousAnimation]);

    const playback = driver.createPlayback(asElement(target), createSelfTimeline(), {
      trigger: 'onClick',
      respectReducedMotion: true,
      reducedMotionStrategy: 'preserve',
      conflictStrategy: 'parallel'
    });

    const createdAnimation = target.getLastAnimation();

    await playback.pause();

    const result = await playback.resume();

    expect(result).toEqual({
      status: 'running',
      reason: 'web-playback-resume'
    });

    expect(playback.status).toBe('running');
    expect(previousAnimation.play).not.toHaveBeenCalled();
    expect(createdAnimation.play).toHaveBeenCalledTimes(1);
  });

  it('does not resume a playback that is not paused', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const createdAnimation = target.getLastAnimation();

    const result = await playback.resume();

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'web-playback-resume-not-allowed-from-running',
      diagnostics: [
        {
          level: 'warning',
          code: 'playback-invalid-transition',
          message: 'Cannot run "resume" while playback is "running".',
          source: 'web-motion-playback-controller',
          metadata: {
            action: 'resume',
            currentStatus: 'running'
          }
        }
      ]
    });

    expect(playback.status).toBe('running');
    expect(createdAnimation.play).not.toHaveBeenCalled();
  });

  it('does not pause a cancelled playback', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const createdAnimation = target.getLastAnimation();

    await playback.cancel();

    const result = await playback.pause();

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'web-playback-pause-not-allowed-from-cancelled',
      diagnostics: [
        {
          level: 'warning',
          code: 'playback-invalid-transition',
          message: 'Cannot run "pause" while playback is "cancelled".',
          source: 'web-motion-playback-controller',
          metadata: {
            action: 'pause',
            currentStatus: 'cancelled'
          }
        }
      ]
    });

    expect(playback.status).toBe('cancelled');
    expect(createdAnimation.pause).not.toHaveBeenCalled();
  });

  it('does not resume a finished playback', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const createdAnimation = target.getLastAnimation();

    await playback.finish();

    const result = await playback.resume();

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'web-playback-resume-not-allowed-from-finished',
      diagnostics: [
        {
          level: 'warning',
          code: 'playback-invalid-transition',
          message: 'Cannot run "resume" while playback is "finished".',
          source: 'web-motion-playback-controller',
          metadata: {
            action: 'resume',
            currentStatus: 'finished'
          }
        }
      ]
    });

    expect(playback.status).toBe('finished');
    expect(createdAnimation.play).not.toHaveBeenCalled();
  });

  it('does not finish a cancelled playback', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const createdAnimation = target.getLastAnimation();

    await playback.cancel();

    const result = await playback.finish();

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'web-playback-finish-not-allowed-from-cancelled',
      diagnostics: [
        {
          level: 'warning',
          code: 'playback-invalid-transition',
          message: 'Cannot run "finish" while playback is "cancelled".',
          source: 'web-motion-playback-controller',
          metadata: {
            action: 'finish',
            currentStatus: 'cancelled'
          }
        }
      ]
    });

    expect(playback.status).toBe('cancelled');
    expect(createdAnimation.finish).not.toHaveBeenCalled();
  });

  it('returns diagnostic when playback transition is invalid', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    await playback.finish();

    const result = await playback.pause();

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'web-playback-pause-not-allowed-from-finished',
      diagnostics: [
        {
          level: 'warning',
          code: 'playback-invalid-transition',
          message: 'Cannot run "pause" while playback is "finished".',
          source: 'web-motion-playback-controller',
          metadata: {
            action: 'pause',
            currentStatus: 'finished'
          }
        }
      ]
    });
  });

  it('emits playback events', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('pause', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    playback.on('resume', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    playback.on('cancel', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    await playback.pause();
    await playback.resume();
    await playback.cancel();

    expect(events).toEqual(['pause:paused', 'resume:running', 'cancel:cancelled']);
  });

  it('emits finish when playback finishes automatically', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('finish', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    await playback.finished;

    expect(events).toEqual(['finish:finished']);
  });

  it('emits skip when playback is skipped automatically', async () => {
    const driver = new WebMotionDriver({
      reducedMotion: true
    });

    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('skip', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    await playback.finished;

    expect(events).toEqual(['skip:skipped']);
  });

  it('emits fail when playback fails automatically', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createChildTimeline('icon'),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('fail', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    await playback.finished;

    expect(events).toEqual(['fail:failed']);
  });

  it('does not emit finish twice when playback is finished manually', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('finish', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    await playback.finish();
    await playback.finished;

    expect(events).toEqual(['finish:finished']);
  });

  it('does not emit events to unsubscribed playback listeners', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    const unsubscribe = playback.on('pause', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    unsubscribe();

    await playback.pause();

    expect(events).toEqual([]);
  });

  it('keeps other playback listeners after one listener is unsubscribed', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    const unsubscribeFirst = playback.on('pause', (event) => {
      events.push(`first:${event.type}:${event.status}`);
    });

    playback.on('pause', (event) => {
      events.push(`second:${event.type}:${event.status}`);
    });

    unsubscribeFirst();

    await playback.pause();

    expect(events).toEqual(['second:pause:paused']);
  });

  it('emits playback event once with once listener', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.once('pause', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    await playback.pause();
    await playback.resume();
    await playback.pause();

    expect(events).toEqual(['pause:paused']);
  });

  it('does not emit once listener after unsubscribe', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    const unsubscribe = playback.once('pause', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    unsubscribe();

    await playback.pause();

    expect(events).toEqual([]);
  });

  it('does not emit events after playback controller is disposed', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('pause', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    playback.on('resume', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    playback.dispose();

    await playback.pause();
    await playback.resume();

    expect(events).toEqual([]);
  });

  it('does not emit once listeners after playback controller is disposed', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.once('pause', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    playback.dispose();

    await playback.pause();

    expect(events).toEqual([]);
  });

  it('does not register new playback listeners after dispose', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.dispose();

    playback.on('pause', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    await playback.pause();

    expect(events).toEqual([]);
  });

  it('does not register new once playback listeners after dispose', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.dispose();

    playback.once('pause', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    await playback.pause();

    expect(events).toEqual([]);
  });

  it('allows disposing playback controller multiple times', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('pause', (event) => {
      events.push(`${event.type}:${event.status}`);
    });

    playback.dispose();
    playback.dispose();

    await playback.pause();

    expect(events).toEqual([]);
  });

  it('marks playback controller as not disposed by default', () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    expect(playback.disposed).toBe(false);
  });

  it('marks playback controller as disposed after dispose', () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    playback.dispose();

    expect(playback.disposed).toBe(true);
  });

  it('keeps playback controller disposed after multiple dispose calls', () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    playback.dispose();
    playback.dispose();

    expect(playback.disposed).toBe(true);
  });

  it('includes previous status in pause playback event', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('pause', (event) => {
      events.push(`${event.previousStatus}->${event.status}`);
    });

    await playback.pause();

    expect(events).toEqual(['running->paused']);
  });

  it('includes previous status in resume playback event', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('resume', (event) => {
      events.push(`${event.previousStatus}->${event.status}`);
    });

    await playback.pause();
    await playback.resume();

    expect(events).toEqual(['paused->running']);
  });

  it('includes previous status in automatic finish playback event', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('finish', (event) => {
      events.push(`${event.previousStatus}->${event.status}`);
    });

    await playback.finished;

    expect(events).toEqual(['running->finished']);
  });

  it('emits statusChange when playback is paused', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('statusChange', (event) => {
      events.push(`${event.type}:${event.previousStatus}->${event.status}`);
    });

    await playback.pause();

    expect(events).toEqual(['statusChange:running->paused']);
  });

  it('emits statusChange when playback is resumed', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('statusChange', (event) => {
      events.push(`${event.type}:${event.previousStatus}->${event.status}`);
    });

    await playback.pause();
    await playback.resume();

    expect(events).toEqual(['statusChange:running->paused', 'statusChange:paused->running']);
  });

  it('emits specific event and statusChange for the same transition', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('pause', (event) => {
      events.push(`specific:${event.previousStatus}->${event.status}`);
    });

    playback.on('statusChange', (event) => {
      events.push(`global:${event.previousStatus}->${event.status}`);
    });

    await playback.pause();

    expect(events).toEqual(['specific:running->paused', 'global:running->paused']);
  });

  it('emits statusChange when playback finishes automatically', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const events: string[] = [];

    playback.on('statusChange', (event) => {
      events.push(`${event.previousStatus}->${event.status}`);
    });

    await playback.finished;

    expect(events).toEqual(['running->finished']);
  });

  it('includes timestamp in playback events', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const timestamps: number[] = [];

    playback.on('pause', (event) => {
      timestamps.push(event.timestamp);
    });

    await playback.pause();

    expect(timestamps).toHaveLength(1);
    expect(typeof timestamps[0]).toBe('number');
    expect(timestamps[0]).toBeGreaterThan(0);
  });

  it('includes timestamp in statusChange playback event', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const timestamps: number[] = [];

    playback.on('statusChange', (event) => {
      timestamps.push(event.timestamp);
    });

    await playback.pause();

    expect(timestamps).toHaveLength(1);
    expect(typeof timestamps[0]).toBe('number');
    expect(timestamps[0]).toBeGreaterThan(0);
  });

  it('includes timestamp in specific and statusChange events', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const playback = driver.createPlayback(
      asElement(target),
      createSelfTimeline(),
      defaultPlayOptions
    );

    const timestamps: number[] = [];

    playback.on('pause', (event) => {
      timestamps.push(event.timestamp);
    });

    playback.on('statusChange', (event) => {
      timestamps.push(event.timestamp);
    });

    await playback.pause();

    expect(timestamps).toHaveLength(2);
    expect(timestamps[0]).toBeGreaterThan(0);
    expect(timestamps[1]).toBeGreaterThan(0);
  });

  it('fails playback when timeline is invalid', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const result = await driver.play(
      asElement(target),
      {
        tracks: [
          {
            target: {
              type: 'self'
            },
            steps: [
              {
                duration: -1,
                keyframes: []
              }
            ]
          }
        ]
      },
      defaultPlayOptions
    );

    expect(result).toMatchObject({
      status: 'failed',
      reason: 'invalid-timeline',
      diagnostics: [
        {
          level: 'error',
          code: 'timeline-empty-keyframes',
          source: 'motion-timeline-validator',
          metadata: {
            trackIndex: 0,
            stepIndex: 0
          }
        },
        {
          level: 'error',
          code: 'timeline-invalid-duration',
          source: 'motion-timeline-validator',
          metadata: {
            trackIndex: 0,
            stepIndex: 0,
            duration: -1
          }
        }
      ]
    });

    expect(target.animate).not.toHaveBeenCalled();
  });

  it('skips timeline validation when timeline is already validated', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const result = await driver.play(
      asElement(target),
      {
        tracks: [
          {
            target: {
              type: 'self'
            },
            steps: [
              {
                duration: 100,
                keyframes: []
              }
            ]
          }
        ]
      },
      {
        ...defaultPlayOptions,
        timelineValidated: true
      }
    );

    expect(result).toEqual({
      status: 'finished'
    });

    expect(target.animate).toHaveBeenCalledTimes(1);
  });
});

class FakeElement {
  private readonly queryAllResults = new Map<string, ReadonlyArray<Element>>();

  setQueryAllResult(selector: string, elements: ReadonlyArray<Element>): void {
    this.queryAllResults.set(selector, elements);
  }

  querySelectorAll(selector: string): NodeListOf<Element> {
    return (this.queryAllResults.get(selector) ?? []) as unknown as NodeListOf<Element>;
  }

  readonly animate = vi.fn(
    (
      _keyframes: Keyframe[] | PropertyIndexedKeyframes,
      _options?: number | KeyframeAnimationOptions
    ): Animation => {
      const animation = createAnimationMock();

      this.animations.push(animation);

      return animation;
    }
  );

  readonly getAnimations = vi.fn((_options?: { readonly subtree?: boolean }): Animation[] => {
    return this.animations;
  });

  readonly removeAttribute = vi.fn((_name: string): void => {});

  private readonly queryResults = new Map<string, Element | null>();
  private animations: Animation[] = [];

  setQueryResult(selector: string, element: Element | null): void {
    this.queryResults.set(selector, element);
  }

  setAnimations(animations: ReadonlyArray<Animation>): void {
    this.animations = [...animations];
  }

  setActiveAnimation(): void {
    this.animations.push(createAnimationMock('running'));
  }

  querySelector(selector: string): Element | null {
    return this.queryResults.get(selector) ?? null;
  }

  getLastAnimation(): Animation {
    const animation = this.animations.at(-1);

    if (!animation) {
      throw new Error('No animation found.');
    }

    return animation;
  }
}

function createAnimationMock(playState: AnimationPlayState = 'finished'): Animation {
  const animation = {
    playState,
    finished: Promise.resolve(),
    pause: vi.fn((): void => {}),
    play: vi.fn((): void => {}),
    cancel: vi.fn((): void => {}),
    finish: vi.fn((): void => {})
  };

  return animation as unknown as Animation;
}

function asElement(element: FakeElement): Element {
  return element as unknown as Element;
}

function createSelfTimeline(): MotionTimelineDefinition {
  return {
    tracks: [
      {
        target: {
          type: 'self'
        },
        steps: [
          {
            duration: 250,
            keyframes: [
              {
                opacity: 0
              },
              {
                opacity: 1
              }
            ]
          }
        ]
      }
    ]
  };
}

function createReducedTimeline(): MotionTimelineDefinition {
  return {
    tracks: [
      {
        target: {
          type: 'self'
        },
        steps: [
          {
            duration: 80,
            delay: 0,
            easing: 'linear',
            fill: 'both',
            keyframes: [
              {
                opacity: 0.4
              },
              {
                opacity: 1
              }
            ]
          }
        ]
      }
    ]
  };
}

function createChildTimeline(name: string): MotionTimelineDefinition {
  return {
    tracks: [
      {
        target: {
          type: 'child',
          name
        },
        steps: [
          {
            duration: 250,
            keyframes: [
              {
                opacity: 0
              },
              {
                opacity: 1
              }
            ]
          }
        ]
      }
    ]
  };
}
