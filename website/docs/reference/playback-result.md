---
sidebar_position: 8
---

# Playback result

A playback result describes the outcome of an animation request.

## Statuses

Common statuses include:

- `finished`
- `running`
- `paused`
- `cancelled`
- `skipped`
- `failed`

## Reason

The result reason explains why the status happened.

For example, an animation can be skipped because of reduced motion or fail because a target could not be resolved.

## Diagnostics

A playback result can include diagnostics.

Diagnostics provide developer-facing information about validation, planning or driver issues.

## Usage

Use the result to make final decisions after playback completes, fails, is cancelled or is skipped.
