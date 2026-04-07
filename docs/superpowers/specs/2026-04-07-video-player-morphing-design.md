# Video Player Morphing Entry Transition

**Date:** 2026-04-07  
**Branch:** `video-player-morphing`  
**File:** `app/page.tsx` (only file changed)

## Problem

When a user hovers "Shader Playground" or "UI Sound Lab" in the bio section, a small `w-64` video preview card appears above the word. Clicking the card opens a full-screen video modal. Currently the modal fades in from center with `scale: 0.97 → 1, blur: 8px → 0px` — it has no positional relationship to the preview card. The entry should morph from the card's exact position and size up to the full modal.

The exit animation (scale + blur + opacity) is correct and stays unchanged.

## Approach: Dynamic `clipPath` inset

At click time, capture the preview card's bounding rect and compute `clipPath: inset(top% right% bottom% left% round 8px)` — percentages that express the card's position relative to the modal's centered rect. Animate to `inset(0% 0% 0% 0% round 0px)` using a spring. The `round 8px` matches the card's `rounded-lg` border-radius, morphing from rounded corners to square as the clip expands.

## Data Flow

```
cardRef (ref on preview card inner div)
  ↓ getBoundingClientRect() at click
videoModal: { src: string; originRect: DOMRect } | null
  ↓ passed to getInitialClipPath()
clipPath string → modal motion.div initial prop
```

## `getInitialClipPath` function

```ts
function getInitialClipPath(originRect: DOMRect): string {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mW = Math.min(720, vw * 0.9);
  const mH = mW * (9 / 16);
  const mLeft = (vw - mW) / 2;
  const mTop = (vh - mH) / 2;

  const top    = ((originRect.top    - mTop)      / mH * 100).toFixed(2);
  const left   = ((originRect.left   - mLeft)     / mW * 100).toFixed(2);
  const bottom = ((mTop + mH - originRect.bottom) / mH * 100).toFixed(2);
  const right  = ((mLeft + mW - originRect.right) / mW * 100).toFixed(2);

  return `inset(${top}% ${right}% ${bottom}% ${left}% round 8px)`;
}
```

Negative inset values are safe — they just mean the card extended past the modal edge and the clip is fully open on that side.

## Modal Animation

```jsx
<motion.div
  initial={{ clipPath: getInitialClipPath(videoModal.originRect), opacity: 1 }}
  animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1 }}
  exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
  transition={{
    clipPath: { type: "spring", stiffness: 100, damping: 20 },
    opacity: { duration: 0 },
  }}
  className="relative aspect-video w-[min(720px,90vw)]"
>
```

## Changes in `page.tsx`

1. Add `cardRef = useRef<HTMLDivElement>(null)`
2. Change `videoModal` type: `string | null` → `{ src: string; originRect: DOMRect } | null`
3. Update `onClick` on preview card to call `getBoundingClientRect()` and set both `src` and `originRect`
4. Attach `ref={cardRef}` to the preview card's inner `motion.div`
5. Update all `videoModal` reads to `videoModal.src` (Escape handler, `src` prop, close buttons)
6. Replace modal `initial`/`animate`/`transition` with clipPath version above
7. Add `getInitialClipPath` as a module-level function

## Fallback

If `cardRef.current` is null at click time, fall back to the existing `scale: 0.97` entry animation so nothing breaks silently.
