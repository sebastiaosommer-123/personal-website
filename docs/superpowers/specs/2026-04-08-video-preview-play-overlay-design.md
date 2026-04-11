# Video Preview Play Overlay

**Date:** 2026-04-08
**Branch:** video-preview-polishing-v2

## Problem

The bio section has inline text links ("UI Sound Lab", "Shader Playground") that trigger a floating video preview card on hover. The card is clickable to expand to a full video modal, but this affordance is not obvious — users may not know to click it.

## Solution

Add a persistent play overlay inside the preview card: a semi-transparent dark scrim over the video, with a centered "Play" button pill. The button brightens when the user hovers anywhere on the card, reinforcing that the whole card is clickable.

## Spec

**File:** `app/page.tsx`

### Changes

1. **Import**: Add `Play` to the existing `lucide-react` import (line 9).

2. **`group` class**: Add `group` to the card `motion.div` that currently has `className="w-64 rounded-lg shadow-md overflow-hidden cursor-pointer"`.

3. **Overlay**: Inside the `<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>` aspect ratio container, after the two `<motion.video>` elements, add:

```tsx
<div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
  <div className="flex items-center gap-1.5 bg-white/40 group-hover:bg-white/70 border border-white/30 rounded-[6px] px-3 py-1.5 transition-colors duration-150">
    <Play className="w-3.5 h-3.5 text-white fill-white" />
    <span className="text-white text-xs font-medium leading-none">Play</span>
  </div>
</div>
```

### Behaviour

- Overlay is always visible while the preview card is shown.
- Entire card hover triggers button bg: `rgba(255,255,255,0.4)` → `rgba(255,255,255,0.7)`.
- `pointer-events-none` on overlay — existing card `onClick` (expand to modal) handles all clicks unchanged.
- No new state, no new event handlers.

### Visual tokens

| Property | Value |
|---|---|
| Scrim | `bg-black/40` = `rgba(0,0,0,0.4)` |
| Button bg (rest) | `bg-white/40` = `rgba(255,255,255,0.4)` |
| Button bg (hover) | `group-hover:bg-white/70` = `rgba(255,255,255,0.7)` |
| Button border | `border border-white/30` = `1px solid rgba(255,255,255,0.3)` |
| Button radius | `rounded-[6px]` |
| Hover transition | `transition-colors duration-150` |

## Verification

- Hover "Shader Playground" or "UI Sound Lab" in bio → preview card appears with dark scrim + Play pill visible.
- Move cursor over card anywhere → Play button brightens to 70% white.
- Click anywhere on card → expands to full video modal as before.
- Mouse off card → card hides as before (existing timer logic unchanged).
