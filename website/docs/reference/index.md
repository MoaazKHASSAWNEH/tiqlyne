---
sidebar_position: 1
---

# API Reference

The reference documents public version 0.1.0 contracts exactly. Use it to look up signatures, fields, normalized defaults, statuses, reasons, diagnostics, and runtime behavior.

- [Public exports](./public-exports.md) lists the supported package entry points.
- Core: engine, registry, config, definitions, options, timelines, and compositions.
- Runtime: drivers, Web behavior, targets, controllers, and results.
- Debugging and policies: diagnostics, events, sampling, inspection, reduced motion, and conflicts.
- Packs: the exact basic-pack catalogue.

## Key reference pages

| Topic                                          | Reference page                                  | Related guide                                                               |
| ---------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| Timeline types, valid values, validation rules | [Motion timeline](./motion-timeline.md)         | [Timeline timing options](../guides/timeline-timing-options.md)             |
| Builder API: createMotionTimeline, track, step | [Timeline builder](./timeline-builder.md)       | [Timeline positions and labels](../guides/timeline-positions-and-labels.md) |
| Composition API                                | [Composition builder](./composition-builder.md) | [Compositions](../guides/compositions.md)                                   |
| Web driver, reset, matchMedia                  | [Web motion driver](./web-motion-driver.md)     | [Engine setup](../guides/engine-setup.md)                                   |
| Controller API: seek, jump, pause              | [Playback controller](./playback-controller.md) | [Playback controllers](../guides/playback-controllers.md)                   |
| Basic pack motions and options                 | [Basic pack](./basic-pack.md)                   | [Basic motions](../guides/basic-motions.md)                                 |

## Custom motion reference path

- [Motion definition](./motion-definition.md): definition metadata, build context, base classes, and lifecycle.
- [Motion registry](./motion-registry.md): registration and lookup contracts.
- [Motion options](./motion-options.md): schemas, normalization, inference, and validators.
- [Timeline builder](./timeline-builder.md): the symbolic timeline authoring API.

For implementation, follow the [end-to-end custom motion tutorial](../tutorials/custom-motion-end-to-end.md), then use the [custom motion](../guides/custom-motion-definition.md) and [registered motions](../guides/registered-motions.md) guides.

For progressive instruction, use [Tutorials](../tutorials/index.md). For focused implementation, use [Guides](../guides/index.md).
