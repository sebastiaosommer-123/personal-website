# Surf Device Screen-Off Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the user clicks the power button on the surf device, the screen fades to black over 100ms before the device slides off-screen.

**Architecture:** Add a `screenOff` boolean state to `SurfDevice`. The power button sets it to `true`, which transitions a black overlay from `opacity: 0 → 1` over 100ms. After 120ms (100ms animation + 20ms settle), `onClose()` is called, triggering the existing exit animation in `page.tsx`. No changes to `page.tsx`.

**Tech Stack:** React (useState), Framer Motion (existing exit animation unchanged), inline CSS transition.

---

### Task 1: Create feature branch

- [ ] **Step 1: Create and check out the branch**

```bash
git checkout -b feat/surf-device-screen-off
```

Expected output:
```
Switched to a new branch 'feat/surf-device-screen-off'
```

---

### Task 2: Add screen-off overlay and delayed close

**Files:**
- Modify: `components/surf-device.tsx`

The change is entirely in `SurfDevice`. Three things:
1. Add `screenOff` state
2. Add a black overlay `div` inside the screen that transitions opacity on `screenOff`
3. Update the power button `onClick` to set `screenOff` and delay `onClose` by 120ms

- [ ] **Step 1: Add `screenOff` state**

In `components/surf-device.tsx`, find the existing state declarations (around line 42–43):

```tsx
const [volumeLevel, setVolumeLevel] = useState(0);
const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
```

Add one line after them:

```tsx
const [volumeLevel, setVolumeLevel] = useState(0);
const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
const [screenOff, setScreenOff] = useState(false);
```

- [ ] **Step 2: Add the screen-off overlay inside the screen div**

Find the screen div (around line 168). It currently looks like:

```tsx
{/* Screen */}
<div className="relative w-full h-[220px] bg-black shrink-0 border-b border-[#C8CACD] dark:border-gunmetal-900 z-20">
  <div className="absolute inset-[1px] rounded-t-[31px] rounded-b-[4px] overflow-hidden">
    <video
      ref={videoRef}
      className="w-full h-full"
      style={{ objectFit: "cover" }}
      muted
      loop
      playsInline
      autoPlay
    />
  </div>
  <div className="absolute inset-[1px] border-[1.5px] border-gunmetal-800 rounded-t-[31px] rounded-b-[4px] pointer-events-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.5)]" />
</div>
```

Add the overlay `div` as the last child inside the outer screen `div`, after the border overlay:

```tsx
{/* Screen */}
<div className="relative w-full h-[220px] bg-black shrink-0 border-b border-[#C8CACD] dark:border-gunmetal-900 z-20">
  <div className="absolute inset-[1px] rounded-t-[31px] rounded-b-[4px] overflow-hidden">
    <video
      ref={videoRef}
      className="w-full h-full"
      style={{ objectFit: "cover" }}
      muted
      loop
      playsInline
      autoPlay
    />
  </div>
  <div className="absolute inset-[1px] border-[1.5px] border-gunmetal-800 rounded-t-[31px] rounded-b-[4px] pointer-events-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.5)]" />
  <div
    className="absolute inset-[1px] rounded-t-[31px] rounded-b-[4px] bg-black pointer-events-none z-10"
    style={{
      opacity: screenOff ? 1 : 0,
      transition: "opacity 100ms cubic-bezier(0.23, 1, 0.32, 1)",
    }}
  />
</div>
```

- [ ] **Step 3: Update the power button onClick**

Find the power button (around line 232). It currently reads:

```tsx
onClick={() => { playClick(); onClose(); }}
```

Replace with:

```tsx
onClick={() => {
  playClick();
  setScreenOff(true);
  setTimeout(() => onClose(), 120);
}}
```

- [ ] **Step 4: Verify the dev server compiles without errors**

```bash
pnpm dev
```

Open `http://localhost:3000`. Check the terminal — no TypeScript errors, no build warnings. If there are errors, fix them before continuing.

- [ ] **Step 5: Visual verification**

1. Open `http://localhost:3000`
2. Click the "surf" toggle to open the device
3. Click the power button (⏻)
4. Confirm: the screen goes black immediately (~100ms), then the device slides down (~500ms)
5. Reopen the device and confirm the screen is live (video playing) on entry — no black flash during entry

- [ ] **Step 6: Commit**

```bash
git add components/surf-device.tsx
git commit -m "feat: screen goes black on power button before slide-out"
```

---

### Task 3: Reset `screenOff` state on reopen (defensive)

**Files:**
- Modify: `components/surf-device.tsx`

`screenOff` resets automatically when the component unmounts and remounts (because `AnimatePresence` unmounts the component after the exit animation). However, if the component is ever kept mounted and re-shown without unmounting, the screen would start black. Add a reset for safety.

- [ ] **Step 1: Reset `screenOff` when the component becomes visible**

This requires knowing when `surfOpen` goes from `false` → `true`. The cleanest way inside `SurfDevice` is to expose nothing — since the component is unmounted and remounted by `AnimatePresence` on every open/close cycle, `useState(false)` already resets to `false` on each mount.

Confirm this is the case by checking `page.tsx` line 402:

```tsx
<AnimatePresence initial={false} onExitComplete={() => { dragX.set(0); dragY.set(0); }}>
  {surfOpen && (
    ...
    <SurfDevice ref={surfHandleRef} onClose={closeSurf} />
    ...
  )}
</AnimatePresence>
```

`SurfDevice` is inside the `{surfOpen && (...)}` block — it unmounts when `surfOpen` is `false`. No additional reset logic is needed. No code change required for this task.

- [ ] **Step 2: No commit needed — this task is a verification only**

---
