import { describe, expect, it } from 'vitest';
import { resolveMotionStepPosition } from './resolve-motion-step-position';
import type { MotionTimelineLabels } from '../models/motion-timeline';

describe('resolveMotionStepPosition', () => {
  const labels: MotionTimelineLabels = {
    intro: 100,
    content: 300,
    outro: 800
  };

  it('returns the cursor when position is undefined', () => {
    expect(resolveMotionStepPosition(undefined, labels, 250)).toBe(250);
  });

  it('returns a numeric position directly', () => {
    expect(resolveMotionStepPosition(400, labels, 250)).toBe(400);
  });

  it('resolves a string label position', () => {
    expect(resolveMotionStepPosition('intro', labels, 250)).toBe(100);
  });

  it('falls back to cursor when a string label is unknown', () => {
    expect(resolveMotionStepPosition('missing', labels, 250)).toBe(250);
  });

  it('falls back to cursor when labels are not provided for a string label', () => {
    expect(resolveMotionStepPosition('intro', undefined, 250)).toBe(250);
  });

  it('resolves a typed label position without offset', () => {
    expect(resolveMotionStepPosition({ label: 'content' }, labels, 250)).toBe(300);
  });

  it('resolves a typed label position with positive offset', () => {
    expect(resolveMotionStepPosition({ label: 'content', offset: 50 }, labels, 250)).toBe(350);
  });

  it('resolves a typed label position with negative offset', () => {
    expect(resolveMotionStepPosition({ label: 'outro', offset: -100 }, labels, 250)).toBe(700);
  });

  it('falls back to cursor plus offset when a typed label is unknown', () => {
    expect(resolveMotionStepPosition({ label: 'missing', offset: 50 }, labels, 250)).toBe(300);
  });

  it('falls back to cursor plus offset when labels are not provided for a typed label', () => {
    expect(resolveMotionStepPosition({ label: 'intro', offset: 50 }, undefined, 250)).toBe(300);
  });

  it('resolves a track-start anchor position', () => {
    expect(resolveMotionStepPosition({ anchor: 'track-start' }, labels, 250)).toBe(0);
  });

  it('resolves a track-start anchor position with offset', () => {
    expect(resolveMotionStepPosition({ anchor: 'track-start', offset: 100 }, labels, 250)).toBe(
      100
    );
  });

  it('resolves a track-end anchor position', () => {
    expect(resolveMotionStepPosition({ anchor: 'track-end' }, labels, 250)).toBe(250);
  });

  it('resolves a track-end anchor position with offset', () => {
    expect(resolveMotionStepPosition({ anchor: 'track-end', offset: -50 }, labels, 250)).toBe(200);
  });

  it('resolves a previous-start anchor position', () => {
    expect(
      resolveMotionStepPosition({ anchor: 'previous-start' }, labels, 250, {
        previousStartTime: 100,
        previousEndTime: 300
      })
    ).toBe(100);
  });

  it('resolves a previous-start anchor position with offset', () => {
    expect(
      resolveMotionStepPosition({ anchor: 'previous-start', offset: 50 }, labels, 250, {
        previousStartTime: 100,
        previousEndTime: 300
      })
    ).toBe(150);
  });

  it('resolves a previous-end anchor position', () => {
    expect(
      resolveMotionStepPosition({ anchor: 'previous-end' }, labels, 250, {
        previousStartTime: 100,
        previousEndTime: 300
      })
    ).toBe(300);
  });

  it('resolves a previous-end anchor position with offset', () => {
    expect(
      resolveMotionStepPosition({ anchor: 'previous-end', offset: -50 }, labels, 250, {
        previousStartTime: 100,
        previousEndTime: 300
      })
    ).toBe(250);
  });
});
