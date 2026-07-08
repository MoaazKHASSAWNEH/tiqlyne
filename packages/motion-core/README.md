# @tiqlyne/motion-core

Platform-independent core package for Tiqlyne Motion Engine.

This package contains the engine contracts, registry, motion definitions, timeline model, validation, planning, diagnostics, playback contracts, timeline builder, composition tools, sampler and inspector.

It does not depend on the DOM, React, Angular, Vue, GSAP or the Web Animations API.

## Install

```bash
npm install @tiqlyne/motion-core
```

## Main APIs

- `createMotionEngine`
- `DefaultMotionRegistry`
- `DefaultMotionEngine`
- `BaseMotionDefinition`
- `SchemaMotionDefinition`
- `createMotionTimeline`
- `createMotionComposition`
- `compileMotionComposition`
- `sampleMotionTimeline`
- `inspectMotionTimeline`
- `MotionDriver`
- playback controller contracts
- diagnostics helpers

## Usage

```ts
import { createMotionEngine, DefaultMotionRegistry, NoopMotionDriver } from '@tiqlyne/motion-core';

const registry = new DefaultMotionRegistry();

const motion = createMotionEngine({
  registry,
  driver: new NoopMotionDriver()
});
```

Use `@tiqlyne/motion-web` when you need browser playback.

## License

MIT.
