---
sidebar_position: 12
---

# Motion targets

Core timelines store symbolic `MotionTargetReference` values. The active driver decides what they mean.

| Type       | Core shape                       | Web resolution                                              | Cardinality  |
| ---------- | -------------------------------- | ----------------------------------------------------------- | ------------ |
| `self`     | `{ type: 'self' }`               | Root passed to the engine                                   | one          |
| `child`    | `{ type: 'child', name }`        | First root descendant matching `[data-motion-child="name"]` | zero or one  |
| `selector` | `{ type: 'selector', selector }` | All matching root descendants                               | zero or many |
| `named`    | `{ type: 'named', name }`        | First document match for `[data-motion-name="name"]`        | zero or one  |

```html
<section id="card" aria-labelledby="card-title">
  <h2 id="card-title" data-motion-child="title">Account</h2>
  <ul>
    <li class="item">Profile</li>
    <li class="item">Security</li>
  </ul>
</section>
<div data-motion-name="toast-region" aria-live="polite"></div>
```

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({ duration: 240, easing: 'ease-out', fill: 'both' });

  timeline.track({ type: 'child', name: 'title' }, (track) => {
    track.step((step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
  timeline.track({ type: 'selector', selector: '.item' }, (track) => {
    track.stagger(40);
    track.step((step) => step.to({ opacity: 1 }));
  });
});

await motion.playTimeline(document.querySelector('#card')!, timeline);
```

`resolveWebTarget` returns one element or `null`; `resolveWebTargets` returns an array; `resolveWebTrackTargets` returns all resolved elements or `null` if any track has no match. Consequently one unresolved track fails the full playback with `target-not-found`.

Use stable data attributes rather than styling classes for semantic targets. Preserve document semantics and accessibility relationships—the target system does not add ARIA behavior. Escape dynamic attribute values/selectors before putting them into a timeline.

## Related pages

- [Child targets example](../examples/child-targets.md)
- [Stagger list example](../examples/stagger-list.md)
- [Web driver](./web-motion-driver.md)
