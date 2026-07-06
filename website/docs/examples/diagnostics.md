---
sidebar_position: 11
---

# Diagnostics example

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

The invalid fade ordering produces reason `invalid-motion-options`; validation messages may also be exposed through the result's `error`. Always branch on `status`/`reason` first, then use diagnostics for structured detail.

Related: [Diagnostics guide](../guides/diagnostics.md) and [playback results](../reference/playback-result.md).
