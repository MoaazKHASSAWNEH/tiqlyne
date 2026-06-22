import type { PreparedMotionTimeline } from '../models/prepared-motion-timeline';
import type {
  ScheduledMotionTask,
  ScheduledMotionTimeline
} from '../models/scheduled-motion-timeline';

export function scheduleMotionTimeline(timeline: PreparedMotionTimeline): ScheduledMotionTimeline {
  const tasks = timeline.tracks.flatMap((track) =>
    track.steps.map((step): Omit<ScheduledMotionTask, 'taskIndex'> => {
      return {
        trackIndex: step.trackIndex,
        stepIndex: step.stepIndex,
        startTime: step.startTime,
        endTime: step.endTime,
        duration: step.duration,
        delay: step.delay,
        step
      };
    })
  );

  const sortedTasks = [...tasks]
    .sort((a, b) => {
      if (a.startTime !== b.startTime) {
        return a.startTime - b.startTime;
      }

      if (a.trackIndex !== b.trackIndex) {
        return a.trackIndex - b.trackIndex;
      }

      return a.stepIndex - b.stepIndex;
    })
    .map((task, taskIndex): ScheduledMotionTask => {
      return {
        taskIndex,
        ...task
      };
    });

  return {
    source: timeline,
    tasks: sortedTasks,
    totalDuration: timeline.totalDuration
  };
}
