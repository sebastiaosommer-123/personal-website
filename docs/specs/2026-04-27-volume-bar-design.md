# Volume Bar Redesign — Surf Device

**Date:** 2026-04-27
**Status:** Approved

## Problem

The surf video device shows a volume indicator made of 16 stacked 4×4px circles. The circles feel dated and don't match the directional animation language used elsewhere on the portfolio (testimonials, modals). The goal is to replace them with a conventional vertical track+fill bar with an Emil Kowalski-style entry/exit animation.

## Design

### Visual

- **Structure**: Track + fill. A background track (full height) with a filled portion growing from the bottom.
- **Dimensions**: 4px wide × 80px tall, 2px border-radius on both track and fill.
- **Position**: `absolute`, `right: 12`, `top: 60` — unchanged from current circles.
- **Colors** (dark-mode-aware, matching existing circle values):
  - Track: `rgba(0,0,0,0.1)` / dark: `rgba(255,255,255,0.15)`
  - Fill: `rgba(0,0,0,0.5)` / dark: `rgba(255,255,255,0.75)`

### Fill Behavior

Fill height is tied to `volumeLevel / VOLUME_MAX * 100%` via JSX. Transitions smoothly with `height 80ms cubic-bezier(0.23,1,0.32,1)` on each volume level change.

### Entry Animation (right → left)

Triggered when `volumeLevel` changes after first user interaction. Duration: **200ms**.

| Property    | From                         | To              |
|-------------|------------------------------|-----------------|
| `opacity`   | `0`                          | `1`             |
| `transform` | `translateX(10px) scale(0.95)` | `translateX(0) scale(1)` |
| `filter`    | `blur(8px)`                  | `blur(0px)`     |

Easing: `cubic-bezier(0.23, 1, 0.32, 1)` on all three properties.

### Exit Animation (left → right)

Triggered after a 1000ms idle timeout. Duration: **150ms** (asymmetrically faster than entry).

| Property    | From              | To                           |
|-------------|-------------------|------------------------------|
| `opacity`   | `1`               | `0`                          |
| `transform` | `translateX(0) scale(1)` | `translateX(-10px) scale(0.95)` |
| `filter`    | `blur(0px)`       | `blur(8px)`                  |

### Post-Exit Reset

160ms after the exit starts (after the 150ms transition clears), the transform is imperatively reset to `translateX(10px) scale(0.95)` with `transition: none`, so the next entry always originates from the right.

### Reduced Motion

When `useReducedMotion()` returns `true`:
- `opacity` only — no `transform`, no `filter`.
- Initial JSX state omits transform/filter values.
- Post-exit reset is skipped entirely.

## Implementation

**File**: `components/surf-device.tsx`
**Approach**: Extend the existing `volIndicatorRef` + `el.style.*` imperative pattern. No Framer Motion.

### New additions

```ts
const prefersReducedMotion = useReducedMotion(); // from motion/react
```

### JSX (replaces lines 156–172)

```tsx
<div
  ref={volIndicatorRef}
  className="absolute z-[15] bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.15)]"
  style={{ right: 12, top: 60, width: 4, height: 80, borderRadius: 2,
           opacity: 0, transform: "translateX(10px) scale(0.95)", filter: "blur(8px)" }}
>
  <div
    className="absolute bottom-0 w-full bg-[rgba(0,0,0,0.5)] dark:bg-[rgba(255,255,255,0.75)]"
    style={{
      borderRadius: 2,
      height: `${(volumeLevel / VOLUME_MAX) * 100}%`,
      transition: "height 80ms cubic-bezier(0.23,1,0.32,1)",
    }}
  />
</div>
```

### Animation useEffect (replaces lines 78–92)

```ts
useEffect(() => {
  if (!hasInteractedRef.current) return;
  const el = volIndicatorRef.current;
  if (!el) return;
  const easing = "cubic-bezier(0.23,1,0.32,1)";

  if (prefersReducedMotion) {
    el.style.transition = `opacity 200ms ${easing}`;
    el.style.opacity = "1";
  } else {
    el.style.transition = [
      `opacity 200ms ${easing}`,
      `transform 200ms ${easing}`,
      `filter 200ms ${easing}`,
    ].join(", ");
    el.style.opacity = "1";
    el.style.transform = "translateX(0) scale(1)";
    el.style.filter = "blur(0px)";
  }

  if (volTimerRef.current) clearTimeout(volTimerRef.current);
  volTimerRef.current = setTimeout(() => {
    const el = volIndicatorRef.current;
    if (!el) return;
    if (prefersReducedMotion) {
      el.style.transition = `opacity 150ms ${easing}`;
      el.style.opacity = "0";
    } else {
      el.style.transition = [
        `opacity 150ms ${easing}`,
        `transform 150ms ${easing}`,
        `filter 150ms ${easing}`,
      ].join(", ");
      el.style.opacity = "0";
      el.style.transform = "translateX(-10px) scale(0.95)";
      el.style.filter = "blur(8px)";
      setTimeout(() => {
        const el = volIndicatorRef.current;
        if (!el) return;
        el.style.transition = "none";
        el.style.transform = "translateX(10px) scale(0.95)";
        el.style.filter = "blur(8px)";
      }, 160);
    }
  }, 1000);
}, [volumeLevel, prefersReducedMotion]);
```

## Verification

1. Dev server running — open portfolio, trigger surf device.
2. Volume up/down — bar enters from the right with blur + scale.
3. Stop pressing — after 1s, bar exits to the left.
4. Press again after exit — bar re-enters from the right (not the left).
5. Fill grows/shrinks smoothly per press.
6. Dark mode — track and fill colors flip correctly.
7. Reduce Motion enabled (macOS Accessibility) — opacity-only, no movement.
8. No regressions: circles gone, rest of device UI unaffected.
