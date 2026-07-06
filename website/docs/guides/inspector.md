---
sidebar_position: 9
---

# Timeline inspector

The timeline inspector analyzes the structure of a timeline.

It helps understand tracks, steps, labels, duration and other structural details.

## Inspect a timeline

```ts
import { inspectMotionTimeline } from '@tiqlyne/motion-core';

const inspection = inspectMotionTimeline(timeline);

console.log(inspection);
```

## What inspection is for

Inspection is useful for:

- debugging timelines;
- building developer tools;
- displaying timeline summaries;
- validating authoring output;
- creating visual builders;
- writing tests.

## Common questions

Inspection can help answer questions such as:

- how many tracks does the timeline contain?
- how many steps are present?
- which labels exist?
- what is the timeline duration?
- does the timeline contain infinite playback?
- which targets are used?

## Inspector vs sampler

| Tool      | Purpose                              |
| --------- | ------------------------------------ |
| Inspector | Understand timeline structure.       |
| Sampler   | Read timeline values at time points. |

Use the inspector when you need metadata.

Use the sampler when you need values over time.
