---
sidebar_position: 3
---

# Installation

Tiqlyne Motion Engine is organized as a set of npm packages under the `@tiqlyne` scope.

## Packages

```bash
pnpm add @tiqlyne/motion-core
pnpm add @tiqlyne/motion-web
pnpm add @tiqlyne/motion-pack-basic
```

Or install everything needed for browser usage:

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

## Package roles

| Package | Required | Role |
| --- | --- | --- |
| `@tiqlyne/motion-core` | Yes | Core engine and platform-independent APIs. |
| `@tiqlyne/motion-web` | For browser playback | Web Animations API driver. |
| `@tiqlyne/motion-pack-basic` | Optional | Ready-to-use basic motions. |

## Browser usage

For browser animation playback, use the Web driver:

```ts
import { createMotionEngine } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver(),
});
```

## Framework usage

The core package is framework-agnostic. It does not depend on Angular, React, Vue, Svelte or any browser-specific API.

Framework integrations can use the same engine and delegate execution to a platform driver.

## Current version

The current documentation targets:

```txt
0.1.0
```

This version is intended as the first public pre-release foundation.