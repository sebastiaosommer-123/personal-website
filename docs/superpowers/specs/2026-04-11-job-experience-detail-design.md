# Job Experience Detail — Design Spec

**Date:** 2026-04-11
**Branch:** job-experience-detail
**Status:** Approved

---

## Context

The experience section currently shows a list of job entries with an animated hover background (via `AnimatedBackground`). There is no way to see detail about a role. This feature adds a morphing expand interaction: clicking a job entry reveals a full detail card — same width, growing only in height — with description, highlights, and skill tags. The rest of the page blurs around it to keep focus on the expanded card.

---

## Interaction Flow

1. User hovers an experience row → existing gray background highlight appears (no change).
2. User clicks → the highlight rectangle morphs vertically into the expanded detail card (height grows, width stays fixed).
3. All other page sections blur and dim around the card.
4. User clicks the X button (top-right of image area) or presses Escape → card collapses back to the row, blur lifts.

**Fluid UI principle**: The rectangle background is a shared element across both states. It never disappears — it morphs continuously from collapsed to expanded and back.

---

## Component: MorphingDialog

Install via:
```
npx motion-primitives@latest add morphing-dialog
```

This adds `/components/motion-primitives/morphing-dialog.tsx` using `layoutId` under the hood (motion/react).

### Usage pattern

```tsx
<MorphingDialog>
  <MorphingDialogTrigger>
    {/* existing experience row */}
  </MorphingDialogTrigger>
  <MorphingDialogContainer>
    <MorphingDialogContent>
      {/* expanded card */}
    </MorphingDialogContent>
  </MorphingDialogContainer>
</MorphingDialog>
```

Width is constrained to match the trigger width. Only height animates during the morph.

---

## Data Model

Add the following fields to each entry in the `experience` array in `app/page.tsx`:

```ts
type ExperienceEntry = {
  company: string;
  role: string;
  period: string;
  logo: string;
  image?: string | null;       // path to image; null = red placeholder
  description: string;
  highlights: string[];
  skills: string[];
};
```

Populate all existing entries. Image is `null` for now (renders `#FF0000` background rectangle).

---

## Expanded Card Layout (from Figma node 73:207)

```
┌─────────────────────────────────────┐
│  [image / red placeholder]       ✕  │  ← 241px tall, full width, 12px top radius
│                                     │    X button: Lucide X icon, top-right
├─────────────────────────────────────┤
│  [logo]  Role Title        Period   │  ← same row as collapsed state
│          Company name               │
│                                     │
│  Description paragraph...           │  ← 16px, #222328, 70% opacity, 1.4 line-height
│                                     │
│  Highlights                         │  ← Inter 500, 16px
│  - Bullet one                       │  ← 16px, #222328, 70% opacity, 1.4 line-height
│  - Bullet two                       │
│                                     │
│  [Tag] [Tag] [Tag] [Tag]            │  ← pill chips, wrap
└─────────────────────────────────────┘
```

**Card styles:**
- Background: `var(--color-surface)` (already used on experience logo tiles — adapts to dark mode automatically)
- Border radius: `12px`
- Inner padding: `16px` horizontal, `16px` bottom
- Gap between sections: `16px`
- Gap within header cluster: `8px`

**Tag/pill chip styles (from Figma):**
- Background: `#EEEFF1`
- Border: `1px solid #D5D5D5`
- Border radius: `50px`
- Padding: `7px 10px`
- Height: `30px`
- Font: Inter 400, 14px

**Close button:**
- Position: `absolute top-3 right-3` within the image area
- Icon: Lucide `X` (consistent with video modal close button)
- Style: small circle button, semi-transparent white background, similar to existing modal close

---

## Animation

### Morph (open)

The `MorphingDialog` `layoutId` shared element handles the rectangle morph. Additional overrides:

| Property | Value |
|---|---|
| Easing | `[0.23, 1, 0.32, 1]` (site-wide `--ease-out`) |
| Duration | `0.4s` |
| Width | Fixed — no change during morph |
| Height | Animates from row height (~44px) to full card height |
| Border radius | `12px` throughout (no change needed) |

Content inside the expanded card fades in after the morph begins:
- `opacity: 0 → 1`, `filter: blur(4px) → blur(0px)`
- Delay: `0.15s` (after morph starts)
- Duration: `0.25s`

### Background blur (open state)

All sibling motion blocks outside the active card:
- `filter: blur(8px)`, `opacity: 0.4`
- Duration: `0.4s`, easing `[0.23, 1, 0.32, 1]`
- Implemented by wrapping page sections in `AnimatePresence` / conditional motion props keyed to `selectedExp` state.

### Close (exit)

| Property | Value |
|---|---|
| Card exit | `opacity: 0`, `filter: blur(8px)`, collapses to row height |
| Duration | `0.3s` |
| Easing | `[0.23, 1, 0.32, 1]` |
| Background | blur lifts simultaneously |

Escape key triggers close (add `keydown` listener while card is open).

---

## State

Add to `page.tsx`:

```ts
const [selectedExp, setSelectedExp] = useState<string | null>(null);
```

- `null` = no card open
- `string` = `exp.company` of the open entry

---

## Files Modified

| File | Change |
|---|---|
| `app/page.tsx` | Add `selectedExp` state, extend `experience` data, wire `MorphingDialog` per entry, add blur to sibling sections |
| `components/motion-primitives/morphing-dialog.tsx` | New file (installed via CLI) |

---

## Verification

1. `npm run dev` — open localhost
2. Hover an experience row → gray background highlight animates (existing, unchanged)
3. Click a row → rectangle morphs vertically into full card; width stays identical
4. Other page sections blur smoothly
5. X button and Escape both close the card; blur lifts, rectangle collapses
6. Click the currently open row or another row while card is open → existing card closes first (no two cards open simultaneously)
7. Check dark mode — card background and text colors adapt
8. Check mobile (`isTouch` = true) — hover disabled but click still works
