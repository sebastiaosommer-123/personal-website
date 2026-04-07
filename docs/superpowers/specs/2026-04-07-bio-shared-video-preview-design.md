# Bio Section — Shared Video Preview Window

**Date:** 2026-04-07  
**Status:** Approved

## Problem

"Shader Playground" and "UI Sound Lab" in the bio section each have their own video hover preview card. When moving quickly between them, both cards can be partially visible at the same time — they overlap and feel sluggish.

## Solution

Replace the two separate preview cards with a single shared card that springs between word positions, matching the design philosophy of the experience section's shared hover rectangle.

---

## Design

### 1. Single shared card element

One `motion.div` (fixed position) replaces `shadersCardRef` and `toolsCardRef`. It is invisible when nothing is hovered. A single piece of state, `activeProject: 'shaders' | 'tools' | null`, drives everything.

### 2. Position

The card is always **centered horizontally above the hovered word** — not cursor-following. Position is calculated from the word element's bounding box on mouse enter (`getBoundingClientRect`). The Y is fixed: `wordTop - cardHeight - 12px` gap. The X centers the card over the word.

On switch, Framer Motion animates the card's `x` and `y` values with a spring — no overlap possible since there's only one card.

### 3. Spring timing (matches experience section)

```
type: "spring", stiffness: 400, damping: 35
```

### 4. Appear / disappear (matches existing video card behavior)

```
opacity + scale: 200ms, cubic-bezier(0.23, 1, 0.32, 1)
initial: opacity 0, scale 0.97, translateY 6px
visible: opacity 1, scale 1, translateY 0
```

### 5. Video switching — crossfade

Two `<video>` elements layered on top of each other inside the card. `AnimatePresence` handles a 150ms opacity crossfade when `activeProject` changes. Both videos are preloaded (`preload="auto"`) so switching is instant with no loading stutter.

Each project has its own video src:
- `shaders` → `SHADERS_VIDEO_SRC`
- `tools` → `TOOLS_VIDEO_SRC`

(Currently both use the same placeholder src — the architecture supports them being different.)

### 6. Grace period (hover gap)

A 300ms timeout before hiding the card — same as current implementation — prevents flickering when the cursor briefly crosses the gap between a word and the card.

The card itself also clears the hide timeout on `onMouseEnter`, so hovering the card directly keeps it visible (same as current behavior).

### 7. Click to modal

Clicking the card opens the full-screen video modal for the currently active project. No change to the modal itself.

### 8. Touch devices

No change — hover previews are already disabled on touch (`isTouch` check). The card is never shown on touch.

---

## Implementation Notes

- Remove `shadersCardRef`, `toolsCardRef`, `shadersHideTimer`, `toolsHideTimer` from state/refs.
- Add: `activeProject: 'shaders' | 'tools' | null` state, `sharedCardRef`, `hideTimer` ref.
- The `onMouseEnter` on each word sets `activeProject` and computes the new position. The card's `animate` prop receives `{ x, y, opacity, scale }`.
- No new components needed — implement inline in `page.tsx`.
- `SHADERS_VIDEO_SRC` and `TOOLS_VIDEO_SRC` replace `PREVIEW_VIDEO_SRC` (can be the same value initially).

---

## What stays the same

- Card size (256px wide, `aspect-video`)
- Card shape (`rounded-lg`, `shadow-md`, `overflow-hidden`)
- Modal behavior
- All other bio section markup and styling
