import { describe, expect, it } from 'vitest';
import { prepareMotionTimeline } from '../compiler/prepare-motion-timeline';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { scheduleMotionTimeline } from './schedule-motion-timeline';

describe('scheduleMotionTimeline', () => {
  it('creates scheduled tasks from a prepared timeline', () => {
    const timeline = prepareMotionTimeline(createSingleTrackTimeline());

    const scheduled = scheduleMotionTimeline(timeline);

    expect(scheduled.source).toBe(timeline);
    expect(scheduled.totalDuration).toBe(350);
    expect(scheduled.tasks).toHaveLength(2);

    expect(scheduled.tasks[0]).toMatchObject({
      taskIndex: 0,
      trackIndex: 0,
      stepIndex: 0,
      startTime: 0,
      endTime: 100,
      duration: 100,
      delay: 0
    });

    expect(scheduled.tasks[1]).toMatchObject({
      taskIndex: 1,
      trackIndex: 0,
      stepIndex: 1,
      startTime: 150,
      endTime: 350,
      duration: 200,
      delay: 50
    });
  });

  it('sorts tasks by start time', () => {
    const timeline = prepareMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              delay: 100,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            }
          ]
        },
        {
          target: {
            type: 'selector',
            selector: '.item'
          },
          steps: [
            {
              duration: 100,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    });

    const scheduled = scheduleMotionTimeline(timeline);

    expect(scheduled.tasks.map((task) => task.startTime)).toEqual([0, 100]);
    expect(scheduled.tasks.map((task) => task.trackIndex)).toEqual([1, 0]);
  });

  it('uses track index and step index as stable ordering when start time is equal', () => {
    const timeline = prepareMotionTimeline({
      tracks: [
        {
          target: {
            type: 'selector',
            selector: '.b'
          },
          steps: [
            {
              duration: 100,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            }
          ]
        },
        {
          target: {
            type: 'selector',
            selector: '.a'
          },
          steps: [
            {
              duration: 100,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    });

    const scheduled = scheduleMotionTimeline(timeline);

    expect(scheduled.tasks.map((task) => task.trackIndex)).toEqual([0, 1]);
    expect(scheduled.tasks.map((task) => task.taskIndex)).toEqual([0, 1]);
  });

  it('keeps the original prepared step reference', () => {
    const timeline = prepareMotionTimeline(createSingleTrackTimeline());

    const scheduled = scheduleMotionTimeline(timeline);

    expect(scheduled.tasks[0]?.step).toBe(timeline.tracks[0]?.steps[0]);
    expect(scheduled.tasks[1]?.step).toBe(timeline.tracks[0]?.steps[1]);
  });

  it('schedules tasks using prepared absolute step positions', () => {
    const prepared = prepareMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 200,
              duration: 100,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            },
            {
              at: 50,
              duration: 100,
              keyframes: [
                {
                  opacity: 0
                }
              ]
            }
          ]
        }
      ]
    });

    const scheduled = scheduleMotionTimeline(prepared);

    expect(scheduled.tasks.map((task) => task.startTime)).toEqual([50, 200]);
    expect(scheduled.totalDuration).toBe(300);
  });
});

function createSingleTrackTimeline(): MotionTimelineDefinition {
  return {
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
              }
            ]
          },
          {
            duration: 200,
            delay: 50,
            keyframes: [
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
