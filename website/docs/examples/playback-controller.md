---
sidebar_position: 7
---

# Playback controller example

```ts
const playback = motion.createTimelinePlayback(element, timeline);

playback.on('pause', ({ status }) => console.log(status));

await playback.pause();
await playback.seek(150);
await playback.seekProgress(0.5);
await playback.jumpToLabel('details');
await playback.setPlaybackRate(1.5);
await playback.playBackward();
await playback.playForward();
await playback.resume();

const finalResult = await playback.finished;
playback.dispose();
```

Every controller operation is asynchronous. Check its result: unsupported actions are reported as `skipped`, while invalid transitions or runtime failures include reasons and often diagnostics.
