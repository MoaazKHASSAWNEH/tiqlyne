---
sidebar_position: 1
---

# Internal vanilla example

The repository includes a vanilla browser demo for maintainers and contributors. It is not required to use Tiqlyne Motion Engine in an application.

It demonstrates how to use Tiqlyne without a framework.

## What it demonstrates

The example covers:

- engine creation
- Web driver usage
- basic motion pack registration
- direct timeline playback
- composition playback
- playback controller usage
- playback event logging

## Run the example

From the repository root:

```bash
pnpm install
pnpm --filter @tiqlyne/motion-example-vanilla dev
```

Or from the example folder:

```bash
cd examples/vanilla
pnpm dev
```

## Build the example

```bash
pnpm --filter @tiqlyne/motion-example-vanilla build
```

## Usage

Use this demo to verify repository packages together and inspect controller/event behavior. Consumer-facing copy-paste samples live in [Examples](../examples/index.md).
