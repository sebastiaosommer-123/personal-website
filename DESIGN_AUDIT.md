# Portfolio Design Audit

Critique against Emil Kowalski's design engineering principles and the "make interfaces feel better" checklist.

---

## What's Working Well

- **Custom easing `[0.23, 1, 0.32, 1]`** used consistently across all transitions — exactly right.
- **Staggered entrance animations** (0 → 80 → 160 → 240 → 320 → 400ms) — feels sequenced, not jarring.
- **`font-variant-numeric: tabular-nums`** on experience period dates — prevents layout shift.
- **`antialiased`** class on body — correct for macOS font rendering.
- **`text-wrap: "pretty"`** on the first bio paragraph — orphan prevention.
- **Multi-layer shadows** on floating skill cards — no hard borders, depth adapts to background.
- **Spring physics** on elastic lines — `stiffness: 800, damping: 40` — snappy and physical.
- **EMA smoothing (α=0.15)** on gyroscope tilt — thoughtful sensor noise reduction.
- **`sr-only` + `aria-hidden`** on animated text spans — accessibility handled.
- **`pointer-events-none`** on the floating skills overlay — doesn't block underlying interactions.

---

## Issues

### Priority 1 — Broken interactions

| Before | After | Why |
|--------|-------|-----|
| Theme toggler: icon instantly swaps Sun ↔ Moon with no transition | Cross-fade with `opacity`, `scale(0.25→1)`, `blur(4px→0px)` | Per icon animation spec: never toggle visibility, always cross-fade. The jarring snap undermines the otherwise polished toggle. |
| Skill tags: click triggers float with no press feedback | Add `active:scale-[0.96]` to skill `<motion.span>` | Pressable elements must acknowledge the press. The float starts but there's no tactile confirmation at the moment of click. |
| Skill tags: disappear instantly when clicked (no exit animation) | `AnimatePresence` + `exit={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}` | The layout reflow is smooth (Motion `layout`), but the leaving element itself just blinks out. |
| Theme toggler button: 20px icon, no padding | Add `p-2` to guarantee ≥40×40px hit area | The 20px Lucide icon with zero padding has a ~20px hit area — half the minimum. Easy to mis-tap. |
| Social links arrow: `transition-all duration-300` | `transition: transform 300ms, opacity 300ms` with explicit easing | `transition: all` animates every CSS property — unexpected side effects and a known perf issue. |

### Priority 2 — Touch device issues

| Before | After | Why |
|--------|-------|-----|
| Underline reveal on "I surf", "play with shaders", "build tools" — no touch guard | Wrap hover styles with `@media (hover: hover) and (pointer: fine)` | Touch devices fire hover on tap, triggering the underline on first tap instead of on link activation. Broken on mobile. |
| Social links underline hover — no touch guard | Same `@media (hover: hover)` wrapper | Same issue. The whole underline hover system needs this guard. |

### Priority 3 — Visual polish

| Before | After | Why |
|--------|-------|-----|
| Second and third bio paragraphs missing `textWrap: "pretty"` | Add to all three `<p>` tags | Only the first paragraph prevents orphans. The other two can produce lone words on the last line. |
| Experience logo `<img>` elements: no subtle outline | `outline: 1px solid rgba(0,0,0,0.06)` (light) / `rgba(255,255,255,0.06)` (dark) | A barely-visible 1px ring gives images consistent depth — especially where logos bleed into the white background. |
| Floating skill fade-in: `initial={{ opacity: 0 }}` only | Add `scale: 0.88` to initial | Nothing in the real world appears from nothing. A subtle scale makes the entrance feel physical. |
| `opacity: 0.54` on "Founding Product Designer" | `color: "var(--color-fg-muted)"` | The token already exists. Opacity-stacking is fragile — in dark mode the two approaches produce different results. |
| `opacity: 0.7` on company name in experience rows | `color: "var(--color-fg-muted)"` | Same issue. `--color-fg-muted` is `#464749` (light) / `#A0A2A4` (dark) — designed exactly for secondary text. |
| `<div className="h-[0.75em]" />` spacers between bio paragraphs | `mt-[0.75em]` margin on `<p>`, or `flex flex-col gap-[0.75em]` wrapper | Empty divs for spacing are semantic noise. |

### Priority 4 — Accessibility & safety

| Before | After | Why |
|--------|-------|-----|
| Social links with `target="_blank"`: no `rel` attribute | `rel="noopener noreferrer"` | Without `rel="noopener"`, `_blank` links are vulnerable to reverse tabnapping. `noreferrer` also prevents referrer leakage. |
| No `prefers-reduced-motion` handling anywhere | `useReducedMotion()` from Motion; disable Float/Tilt/ElasticLine when true | The floating physics, tilt, elastic lines, and entrance blur are all vestibular triggers. Not handling reduced motion is an accessibility failure — especially on a product designer's portfolio. |

---

## Files to Touch

| File | What to fix |
|------|-------------|
| `app/page.tsx` | Skill tag exit anim, press states, bio `textWrap`, opacity tokens, logo outlines, social `rel`, floating skill scale-in |
| `components/ui/animated-theme-toggler.tsx` | Icon cross-fade animation, hit area padding |
| `components/fancy/blocks/float.tsx` | `prefers-reduced-motion` check |
| `components/motion-primitives/tilt.tsx` | `prefers-reduced-motion` check |
| `components/fancy/physics/elastic-line.tsx` | `prefers-reduced-motion` check |
| `app/globals.css` | `@media (hover: hover)` guard for underline effects (or handle in Tailwind with `[@media(hover:hover)]:hover:` prefix) |
