# Surf Device — Screen-Off on Power Button

**Date:** 2026-04-20
**Status:** Approved

---

## Problem

When the user clicks the power button on the surf video device, the device slides off-screen but the video screen stays live the entire time. The screen never reacts to the power button press. This breaks the physical device metaphor — a power button that doesn't turn the screen off doesn't feel like a power button.

## Decision

Add a screen-blackout animation that fires when the power button is pressed, before the device slides down.

**No entry animation.** The device entering from off-screen implies it was always on, just out of frame — the user is summoning it, not powering it on. Adding a screen-on sequence during entry would also create a buffering-dependent race condition where a slow video load makes it look like a bug.

---

## Spec

### Power-off sequence (two beats)

| Beat | What happens | Duration | Easing |
|------|-------------|----------|--------|
| 1 | Screen background transitions to `#000` | 100ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| 2 | Device slides down (`y: 0 → "100vh"`, `opacity: 1 → 0`) | 500ms | `cubic-bezier(0.23, 1, 0.32, 1)` |

Beat 2 begins immediately after beat 1 completes. Total end-to-end: **600ms**.

### Entry sequence — unchanged

The device slides in from `y: "100vh"` to `y: 0` with `opacity: 0 → 1` over 500ms. No screen state change on entry.

### Easing rationale

`cubic-bezier(0.23, 1, 0.32, 1)` is the site's existing strong ease-out. Used on every motion element across the page. No new motion language is introduced.

### Duration rationale

100ms is in the button-press feedback range (100–160ms per Emil Kowalski's framework). The screen-off is system feedback to a button press — it should be fast. 150ms+ would feel sluggish relative to the site's existing interaction speed.

---

## Implementation

### What changes

**`components/surf-device.tsx`** — the power button's `onClick` handler currently calls `onClose()` immediately. It needs to:
1. Trigger a local `screenOff` state → transitions the screen div's background to black over 100ms
2. After 100ms, call `onClose()` — which triggers the existing `AnimatePresence` exit animation in `page.tsx`

### Screen element

The screen div already has `bg-black` as its base. The video sits inside it. The blackout is achieved by rendering a `div` overlay (or transitioning an opacity layer) over the video from `opacity: 0` to `opacity: 1` over 100ms using `transition: opacity 100ms cubic-bezier(0.23, 1, 0.32, 1)`.

Using an opacity overlay (rather than hiding the video) avoids any flicker from the video element unmounting early.

### State

Add `screenOff: boolean` state to `SurfDevice`. When `true`, the overlay is fully opaque (black). When the component unmounts (after `onClose()` fires), the state is discarded automatically — no cleanup needed.

### No changes to `page.tsx`

The `onClose` → `setSurfOpen(false)` → `AnimatePresence` exit path is unchanged. The 100ms delay is absorbed inside `SurfDevice` before `onClose` is called.

---

## Out of scope

- Screen-on animation during entry
- Any changes to the peek/hover animation
- Volume button or playback control interactions
