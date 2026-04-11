# Video Player Lucide Icons — Design Spec

**Date:** 2026-04-09

## Context

The video player modal (used for "UI Sound Lab" and "Shader Playground" projects) currently relies on `media-chrome`'s built-in default SVG icons for the play/pause and mute buttons. These icons are visually inconsistent with the rest of the portfolio, which uses Lucide React (outline/stroke style). The close button uses a `Plus` icon rotated 45°, which is a workaround rather than a semantic close icon.

Goal: Replace all four icon types — play, pause, speaker (unmuted), speaker (muted), and close — with coherent Lucide React outline icons.

## Decisions

| Button | Icon (state A) | Icon (state B) |
|--------|---------------|----------------|
| Play/Pause | `Play` (when paused) | `Pause` (when playing) |
| Mute | `Volume2` (unmuted) | `VolumeX` (muted) |
| Close | `X` | — |

- **Style:** outline (Lucide default stroke, no fill)
- **Approach:** Update wrapper components in `skiper67.tsx` to inject Lucide icons via media-chrome's slot system. Call sites unchanged.

## Files to Modify

### 1. `components/ui/skiper-ui/skiper67.tsx`

**Imports:** Add `Pause, Volume2, VolumeX, X`; remove `Plus`.

**`VideoPlayerPlayButton`:** Render Play and Pause icons as slot children:
```tsx
<MediaPlayButton className={cn("", className)} {...props}>
  <Play slot="play" className="size-4" />
  <Pause slot="pause" className="size-4" />
</MediaPlayButton>
```

**`VideoPlayerMuteButton`:** Render Volume2 and VolumeX icons as slot children:
```tsx
<MediaMuteButton className={cn("", className)} {...props}>
  <Volume2 slot="high" className="size-4" />
  <Volume2 slot="medium" className="size-4" />
  <Volume2 slot="low" className="size-4" />
  <VolumeX slot="off" className="size-4" />
</MediaMuteButton>
```

**Close button** (line ~232): Replace `<Plus className="size-5 rotate-45 text-white" />` with `<X className="size-5 text-white" />`.

### 2. `app/page.tsx`

**Imports:** Remove `Plus`, add `X`.

**Close button** (line ~451): Replace `<Plus className="size-5 rotate-45 text-white" />` with `<X className="size-5 text-white" />`.

No other changes needed — `VideoPlayerPlayButton` and `VideoPlayerMuteButton` are imported from skiper67 and will pick up the new icons automatically.

## Verification

1. Run `npm run dev`
2. Open the portfolio, click either "UI Sound Lab" or "Shader Playground" video card
3. Confirm the close button shows `X` (no rotation)
4. Confirm play/pause button shows outline `Play` icon when paused and outline `Pause` when playing
5. Confirm mute button shows `Volume2` when unmuted and `VolumeX` when muted
6. Confirm all icons match the outline/stroke style of the rest of the site
