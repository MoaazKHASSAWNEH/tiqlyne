# @tiqlyne/motion-web

Official browser driver for Tiqlyne Motion Engine.

This package connects the platform-independent timeline model from `@tiqlyne/motion-core` to DOM elements through the Web Animations API.

## Install

```bash
npm install @tiqlyne/motion-web
```

For browser usage, install it with the core package:

```bash
npm install @tiqlyne/motion-core @tiqlyne/motion-web
```

## Usage

```ts
import { createMotionEngine } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver()
});
```

## Main API

- `WebMotionDriver`
- `WebMotionPlaybackController`
- target resolution helpers
- keyframe and timing conversion helpers
- reduced-motion helpers
- conflict handling helpers

Most applications only need `WebMotionDriver`.

## License

MIT.
