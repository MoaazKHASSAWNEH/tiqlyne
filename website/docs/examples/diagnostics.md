---
sidebar_position: 11
---

# Diagnostics example

## Goal

Display the outcome of an invalid registered-motion request.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

```html
<div id="preview">Diagnostic preview</div>
```

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const element = document.querySelector('#preview');
if (!element) throw new Error('Preview not found');

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);
const motion = createMotionEngine<Element>({ registry, driver: new WebMotionDriver() });

const result = await motion.play(element, {
  id: 'invalid-fade',
  type: 'fade-in',
  options: { fromOpacity: 1, toOpacity: 0 }
});

if (result.status === 'failed') {
  console.error('Playback failed:', result.reason, result.error);
}

for (const diagnostic of result.diagnostics ?? []) {
  const log = diagnostic.level === 'error' ? console.error : console.warn;
  log(`[${diagnostic.source ?? 'unknown'}:${diagnostic.code}] ${diagnostic.message}`);
}
```

## Expected result

The invalid fade ordering produces reason `invalid-motion-options`; validation messages may also be exposed through the result's `error`. Always branch on `status`/`reason` first, then use diagnostics for structured detail.

## Common mistakes

Assuming every failure includes diagnostics or displaying raw developer messages directly to end users.

## Related pages

- [Diagnostics guide](../guides/diagnostics.md)
- [Playback results](../reference/playback-result.md)
