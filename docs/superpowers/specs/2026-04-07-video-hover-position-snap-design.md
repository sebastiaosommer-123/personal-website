# Video Hover Preview: Position Snap + Entrance Animation Fix

**Date:** 2026-04-07  
**Branch:** `side-projects-video-hover`  
**File:** `app/page.tsx`

---

## Problem

Two bugs share the same root cause: the outer `motion.div` wrapping the shared video preview card always spring-animates its `x`/`y` position, even when the card is invisible.

1. **First hover after page load** — `cardPos` starts at `{x: 0, y: 0}`. On first hover, the card springs from `(0,0)` to the correct position, becoming visible mid-flight.
2. **Returning hover after gap** — `cardPos` still holds the last position after hiding. Hovering a different project springs from the old position, making the card appear to slide in from the wrong place.

---

## Solution

### Position mechanism

Remove `cardPos` state (`useState`). Replace with `useMotionValue` + `useSpring`:

```ts
const cardXTarget = useMotionValue(0)
const cardYTarget = useMotionValue(0)
const cardX = useSpring(cardXTarget, { stiffness: 400, damping: 35 })
const cardY = useSpring(cardYTarget, { stiffness: 400, damping: 35 })
```

In `handleProjectEnter`, distinguish fresh appear vs. project switch:

```ts
const newX = rect.left + rect.width / 2 - CARD_W / 2
const newY = rect.top - CARD_H - 12

if (activeProject === null) {
  // Snap: set spring's current value directly → no animation
  cardX.set(newX)
  cardY.set(newY)
}
// Always update target (spring animates if already visible)
cardXTarget.set(newX)
cardYTarget.set(newY)
```

Outer wrapper switches from `animate={{ x, y }}` to `style={{ x: cardX, y: cardY }}`.

### State transition table

| From → To | Position | Visual |
|---|---|---|
| `null → project` (fresh appear) | Snap to target instantly | Entrance animation plays |
| `'shaders' → 'tools'` or vice versa | Spring between positions | No re-entrance |
| `any → null` (hide) | Freezes in place | Exit animation plays |

### Entrance / exit animation

Update the inner card `motion.div`:

| Property | Hidden (resting) | Visible |
|---|---|---|
| `y` | `16px` | `0` |
| `scale` | `0.98` | `1` |
| `opacity` | `0` | `1` |
| `filter` | `blur(4px)` | `blur(0px)` |

- **Enter transition:** `duration: 0.2, ease: [0.23, 1, 0.32, 1]`
- **Exit transition:** `duration: 0.15, ease: [0.23, 1, 0.32, 1]` (faster than enter — exits should be softer)

Asymmetric timing is handled by passing a conditional `transition` prop based on `activeProject`:

```ts
transition={
  activeProject
    ? { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
    : { duration: 0.15, ease: [0.23, 1, 0.32, 1] }
}
```

---

## What stays the same

- Shared card architecture (single card, two videos crossfading)
- Spring slide between projects when card is already visible
- Video crossfade opacity animation
- Hide timer / mouse leave behavior
- All other motion language on the page

---

## Imports to add

```ts
import { useMotionValue, useSpring } from "motion/react"
```

(`motion/react` is already imported for `motion`, `AnimatePresence`.)
