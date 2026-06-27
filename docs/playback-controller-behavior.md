# Structifyx Motion Engine - Playback Controller Behavior

> Status: current implementation reference.
> Scope: controller behavior shared by the core contract and the Web driver implementation.
> Last verified state: after commit `5880634 fix(web): skip finish for infinite playback controllers`.

This document explains how playback controllers behave today, especially for finite animations, infinite animations, manual control, skipped transitions and Web Animations API limits.

## 1. Purpose

A playback controller represents one created playback instance.

It is used when the caller wants to control an animation after creation:

```ts
const playback = motion.createTimelinePlayback(element, timeline);

await playback.pause();
await playback.resume();
await playback.finish();
await playback.cancel();
playback.dispose();
```

The controller is different from a one-shot call such as:

```ts
await motion.playTimeline(element, timeline);
```

Use `playTimeline()` for simple fire-and-wait behavior. Use `createTimelinePlayback()` when the UI needs pause, resume, cancel, finish, event listeners or access to the `finished` promise.

## 2. Current controller statuses

The controller status can currently be:

```txt
running
paused
finished
cancelled
skipped
failed
```

Terminal statuses are handled by the core helper `isTerminalPlaybackStatus()`.

Once a controller reaches a terminal status, control actions return skipped invalid-transition results instead of mutating the controller again.

Terminal examples:

```txt
finished  -> cannot resume
cancelled -> cannot pause
failed    -> cannot cancel
skipped   -> cannot finish
```

## 3. Controller methods

### 3.1 `pause()`

Expected behavior:

```txt
running -> paused
```

The Web controller calls `animation.pause()` only on the animations created by that controller.

It must not pause unrelated animations already present on the target when conflict strategy is `parallel`.

### 3.2 `resume()`

Expected behavior:

```txt
paused -> running
```

The Web controller calls `animation.play()` only on the animations created by that controller.

Calling `resume()` while already running returns a skipped result such as:

```txt
web-playback-resume-not-allowed-from-running
```

### 3.3 `cancel()`

Expected behavior:

```txt
running/paused -> cancelled
```

The Web controller calls `animation.cancel()` only on its own animations.

For infinite animations, `cancel()` is the recommended manual stop operation.

### 3.4 `finish()` for finite animations

Expected behavior on finite animations:

```txt
running/paused -> finished
```

The Web controller calls `animation.finish()` only on its own animations.

### 3.5 `finish()` for infinite animations

Important Web rule:

```txt
Web Animations API cannot safely finish an infinite animation.
```

Browser behavior can throw an `InvalidStateError` for `Animation.finish()` when the animation has infinite iterations.

The Web controller must therefore detect infinite animations before calling `animation.finish()`.

Current expected behavior:

```txt
finish() on infinite animation
  -> returns skipped
  -> reason: web-playback-finish-not-supported-for-infinite-animation
  -> emits skip + statusChange
  -> does not call animation.finish()
  -> does not move the controller to failed
  -> keeps the previous controller status
```

Example result:

```json
{
  "status": "skipped",
  "reason": "web-playback-finish-not-supported-for-infinite-animation",
  "diagnostics": [
    {
      "level": "warning",
      "code": "web-playback-finish-not-supported-for-infinite-animation",
      "message": "Web playback cannot finish an infinite animation. Use cancel() or reset() instead.",
      "source": "web-motion-playback-controller"
    }
  ]
}
```

Why `skipped` instead of `failed`:

```txt
The user requested an operation unsupported for this playback shape.
The engine is not broken.
The browser limitation is known and controlled.
The controller should remain usable.
```

This was introduced to avoid the earlier behavior where `finish()` on an infinite animation failed the controller and made later `pause`, `resume` or `cancel` impossible.

## 4. Infinite timeline behavior

A timeline is infinite when at least one relevant timing path uses:

```ts
iterations: 'infinite';
```

The Web timing conversion maps this to:

```ts
iterations: Infinity;
```

For one-shot playback:

```ts
await motion.playTimeline(element, infiniteTimeline);
```

The Web driver returns:

```json
{
  "status": "running",
  "reason": "web-playback-infinite"
}
```

This is intentional because the animation does not naturally resolve to `finished`.

For controller playback:

```ts
const playback = motion.createTimelinePlayback(element, infiniteTimeline);
```

The controller should remain `running` until the caller pauses, cancels, resets or disposes it.

## 5. Yoyo and direction rule

The timeline validator currently treats `yoyo` and `direction` as mutually exclusive.

Invalid:

```ts
{
  iterations: 'infinite',
  direction: 'alternate',
  yoyo: true
}
```

Valid yoyo form:

```ts
{
  iterations: 'infinite',
  yoyo: true
}
```

Valid direction form:

```ts
{
  iterations: 'infinite',
  direction: 'alternate'
}
```

Reason: `yoyo: true` already expresses an alternating playback intent. Combining it with `direction` creates ambiguous timing semantics.

## 6. Events emitted by playback controllers

Controller events are separate from engine-level events.

Current event types:

```txt
start
statusChange
pause
resume
cancel
finish
skip
fail
```

Examples:

```txt
pause()
  pause
  statusChange

resume()
  resume
  statusChange

cancel()
  cancel
  statusChange

finish() finite
  finish
  statusChange

finish() infinite
  skip
  statusChange
```

Each event includes:

```txt
type
playbackId
status
previousStatus
timestamp
result? when applicable
```

## 7. Listener behavior

Playback controllers support:

```ts
const unsubscribe = playback.on('pause', listener);
const unsubscribeOnce = playback.once('finish', listener);

unsubscribe();
unsubscribeOnce();
```

Important behavior:

```txt
- unsubscribed listeners are not called
- once listeners fire once
- disposed controllers clear listeners
- registering listeners after dispose is a no-op
- disposing multiple times is allowed
```

## 8. Dispose behavior

`dispose()` is not the same as `cancel()`.

Current behavior:

```txt
dispose()
  -> marks the controller as disposed
  -> clears listeners
  -> does not currently emit lifecycle events
```

If a UI wants to stop the actual animation, call `cancel()` or engine `reset()` before/around `dispose()`.

## 9. Error handling rules

Use `failed` for unexpected runtime failures:

```txt
animation.pause() throws
animation.play() throws
animation.cancel() throws
finite animation.finish() throws unexpectedly
```

Use `skipped` for controlled no-op or unsupported transitions:

```txt
resume while running
pause after cancelled
finish after cancelled
finish infinite animation
```

This distinction is important for UI behavior. A failed controller is terminal. A skipped unsupported operation may preserve the previous status when that is safer and more useful, as with `finish()` on infinite Web animations.

## 10. Tests covering this behavior

The main test file is:

```txt
packages/motion-web/src/drivers/web-motion-driver.spec.ts
```

Important test areas:

```txt
- native playback controller creation
- pause failure
- resume failure
- cancel failure
- infinite playback stays running
- finite finish
- finish failure
- finish infinite returns skipped without failing controller
- controller emits playback events
- controller emits statusChange
- controller listener unsubscribe / once / dispose behavior
```

## 11. Recommended visual checks in examples/vanilla

Run:

```bash
pnpm --filter @structifyx/motion-example-vanilla dev
```

Manual checks:

```txt
1. Create infinite/yoyo controller.
2. Pause -> status becomes paused.
3. Resume -> status becomes running.
4. Finish -> returns skipped, not failed.
5. After skipped finish, pause/resume/cancel should still be usable.
6. Cancel -> status becomes cancelled.
7. Reset -> visual state is cleaned.
```

## 12. Future improvement ideas

Do not start these before the next planned documentation/custom guide work unless specifically requested:

```txt
- expose clearer controller capability metadata
- add controller.canFinish or equivalent helper
- add seek support
- add progress events
- add repeat/yoyo event hooks
- add dynamic engine motion.on(...) subscription API
```
