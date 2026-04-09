# Video Player Lucide Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace media-chrome's default SVG icons and the rotated Plus close button with coherent Lucide React outline icons across the video player modal.

**Architecture:** Inject Lucide icon components as slot children into `VideoPlayerPlayButton` and `VideoPlayerMuteButton` wrappers in `skiper67.tsx` — media-chrome's web component slot system picks them up automatically. Replace `Plus` (rotated) with `X` in both files. No call-site changes needed.

**Tech Stack:** Next.js, lucide-react (already installed v1.7.0), media-chrome/react

---

## Files

- Modify: `components/ui/skiper-ui/skiper67.tsx` — wrapper components + close button
- Modify: `app/page.tsx` — close button only

---

### Task 1: Update `skiper67.tsx` — imports + wrapper components + close button

**Files:**
- Modify: `components/ui/skiper-ui/skiper67.tsx`

- [ ] **Step 1: Update the import line**

Replace line 4:
```tsx
import { Play, Plus } from "lucide-react";
```
With:
```tsx
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";
```

- [ ] **Step 2: Update `VideoPlayerPlayButton` to inject Play/Pause slot icons**

Replace lines 77–82:
```tsx
export const VideoPlayerPlayButton = ({
  className,
  ...props
}: VideoPlayerPlayButtonProps) => (
  <MediaPlayButton className={cn("", className)} {...props} />
);
```
With:
```tsx
export const VideoPlayerPlayButton = ({
  className,
  ...props
}: VideoPlayerPlayButtonProps) => (
  <MediaPlayButton className={cn("", className)} {...props}>
    <Play slot="play" className="size-4" />
    <Pause slot="pause" className="size-4" />
  </MediaPlayButton>
);
```

- [ ] **Step 3: Update `VideoPlayerMuteButton` to inject Volume slot icons**

Replace lines 108–113:
```tsx
export const VideoPlayerMuteButton = ({
  className,
  ...props
}: VideoPlayerMuteButtonProps) => (
  <MediaMuteButton className={cn("", className)} {...props} />
);
```
With:
```tsx
export const VideoPlayerMuteButton = ({
  className,
  ...props
}: VideoPlayerMuteButtonProps) => (
  <MediaMuteButton className={cn("", className)} {...props}>
    <Volume2 slot="high" className="size-4" />
    <Volume2 slot="medium" className="size-4" />
    <Volume2 slot="low" className="size-4" />
    <VolumeX slot="off" className="size-4" />
  </MediaMuteButton>
);
```

- [ ] **Step 4: Replace Plus close icon with X**

In the `VideoPopOver` component (around line 232), replace:
```tsx
<Plus className="size-5 rotate-45 text-white" />
```
With:
```tsx
<X className="size-5 text-white" />
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/skiper-ui/skiper67.tsx
git commit -m "feat: replace media-chrome default icons and close button with Lucide React outline icons"
```

---

### Task 2: Update `app/page.tsx` — imports + close button

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update the import line**

Find the lucide-react import (around line 9). Remove `Plus`, add `X`. For example:
```tsx
// before (exact imports may vary — preserve any other icons already there)
import { Power, Plus, Play } from "lucide-react";

// after
import { Play, Power, X } from "lucide-react";
```

- [ ] **Step 2: Replace Plus close icon with X**

Around line 451, replace:
```tsx
<Plus className="size-5 rotate-45 text-white" />
```
With:
```tsx
<X className="size-5 text-white" />
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: use X icon for video modal close button in page.tsx"
```

---

### Task 3: Visual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify all four icons**

1. Open `http://localhost:3000`
2. Click the "UI Sound Lab" or "Shader Playground" video card to open the modal
3. **Close button** — top-right corner should show a clean `X` (no rotation trick)
4. **Play icon** — control bar left should show outline `Play` triangle when paused
5. **Pause icon** — click play; control bar should switch to outline `Pause` (two vertical bars)
6. **Volume unmuted** — mute button should show `Volume2` (speaker with waves)
7. **Volume muted** — click mute; button should switch to `VolumeX` (speaker with X)
8. All icons should be outline/stroke style, matching the rest of the site
