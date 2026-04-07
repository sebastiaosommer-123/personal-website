# Video Modal Morph Origin Fix

**Date:** 2026-04-07  
**Branch:** `video-player-morphing`  
**File:** `app/page.tsx` (only file changed)

## Problem

The existing `clipPath: inset(top% right% bottom% left%)` morph entry animates all four edges toward `0%` simultaneously. Because the preview card sits in the lower portion of the viewport, the top inset is much larger than the bottom inset. The top edge of the clip travels a longer distance than the bottom edge, making the expansion appear bottom-anchored rather than growing from the card's center.

## Approach: Scale + Translate

Replace clipPath with `scale` + `x`/`y` + `borderRadius`. The modal starts scaled to the card's size and translated so its center aligns with the card's center. It then scales to full size and translates back to the viewport center. Because both expand from the same shared center point, the animation is geometrically correct — the card appears to grow outward from its own center.

The card and modal are both 16:9, so a single uniform `scale` factor eliminates any aspect ratio distortion.

## Values Computed at Click Time

```ts
const vw = window.innerWidth;
const vh = window.innerHeight;
const modalWidth = Math.min(720, vw * 0.9);
const scale = cardRect.width / modalWidth;
const offsetX = (cardRect.left + cardRect.width / 2) - vw / 2;
const offsetY = (cardRect.top + cardRect.height / 2) - vh / 2;
```

These three values (`scale`, `offsetX`, `offsetY`) are stored in `videoModal` state alongside `src`.

## State Type

```ts
{ src: string; scale: number; offsetX: number; offsetY: number } | null
```

Replaces the previous `{ src: string; initialClipPath: string } | null`.

## Modal Animation

```tsx
<motion.div
  initial={{ scale: videoModal.scale, x: videoModal.offsetX, y: videoModal.offsetY, borderRadius: "8px" }}
  animate={{ scale: 1, x: 0, y: 0, borderRadius: "0px" }}
  exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
  transition={{
    scale:        { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
    x:            { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
    y:            { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
    borderRadius: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
    opacity:      { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
    filter:       { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
  }}
  className="relative aspect-video w-[min(720px,90vw)]"
>
```

Entry duration is 0.4s (site's large-motion tier, matching the previous clipPath animation). Exit is unchanged at 0.2s.

## Changes in `page.tsx`

1. Remove `getInitialClipPath` module-level function entirely
2. Change `videoModal` state type: `initialClipPath: string` → `scale: number; offsetX: number; offsetY: number`
3. Update click handler to compute `scale`, `offsetX`, `offsetY` from `cardRef.current.getBoundingClientRect()`
4. Replace modal `motion.div` `initial`/`animate`/`transition` props with the scale+translate version above

## Fallback

If `cardRef.current` is null at click time, default to `scale: 0.97, offsetX: 0, offsetY: 0` — a near-invisible scale-in from center, matching the old fade entry, rather than a broken state.
