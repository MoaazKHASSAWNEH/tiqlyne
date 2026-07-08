# @tiqlyne/motion-pack-basic

Basic motion pack for Tiqlyne Motion Engine.

This package provides the first built-in motion definitions for common UI animation needs. It is intended to be used with `@tiqlyne/motion-core` and can be combined with `@tiqlyne/motion-web` for browser playback.

## Install

Install this package with the core package:

```bash
npm install @tiqlyne/motion-core @tiqlyne/motion-pack-basic
```

For browser projects, install the web driver too:

```bash
npm install @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

## Included motions

- `fade-in`
- `fade-out`
- `slide-in`

## Usage

Register this pack in a motion registry before using its motion definitions.

Typical setup:

1. Create a `DefaultMotionRegistry` from `@tiqlyne/motion-core`.
2. Call `registerBasicMotions` from this package.
3. Create a motion engine with the registry and a compatible driver.
4. Use the registered motion names in your animation flow.

## Main API

- `registerBasicMotions`
- fade motion definitions
- slide motion definitions

## License

MIT.
