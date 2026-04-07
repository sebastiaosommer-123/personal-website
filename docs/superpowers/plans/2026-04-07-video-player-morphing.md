# Video Player Morphing Entry Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the user clicks the video preview hover card, the full-screen modal should morph/expand from the card's exact position using a `clipPath` inset animation rather than fading in from center.

**Architecture:** At click time, capture the preview card's `getBoundingClientRect()`, store it alongside the video URL in `videoModal` state, then use a `getInitialClipPath()` helper to convert the card's viewport rect into `clipPath: inset(...)` percentages relative to the modal's centered position. The modal animates from that clipped initial state to `inset(0% 0% 0% 0%)`. Exit animation is unchanged.

**Tech Stack:** Next.js 15, Framer Motion (`motion/react`), TypeScript — all in `app/page.tsx`

---

## Files

- Modify: `app/page.tsx`

---

### Task 1: Add `getInitialClipPath` helper and update `videoModal` state type

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add `getInitialClipPath` as a module-level function**

  Add this function immediately before `export default function Home()` (around line 71):

  ```ts
  function getInitialClipPath(originRect: DOMRect): string {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mW = Math.min(720, vw * 0.9);
    const mH = mW * (9 / 16);
    const mLeft = (vw - mW) / 2;
    const mTop = (vh - mH) / 2;

    const top    = ((originRect.top    - mTop)           / mH * 100).toFixed(2);
    const left   = ((originRect.left   - mLeft)          / mW * 100).toFixed(2);
    const bottom = ((mTop + mH - originRect.bottom)      / mH * 100).toFixed(2);
    const right  = ((mLeft + mW - originRect.right)      / mW * 100).toFixed(2);

    return `inset(${top}% ${right}% ${bottom}% ${left}% round 8px)`;
  }
  ```

- [ ] **Step 2: Update `videoModal` state type**

  On line 75, change:
  ```ts
  const [videoModal, setVideoModal] = useState<string | null>(null);
  ```
  To:
  ```ts
  const [videoModal, setVideoModal] = useState<{ src: string; originRect: DOMRect } | null>(null);
  ```

---

### Task 2: Attach `cardRef` to the preview card and update the click handler

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add `cardRef`**

  On line 74 (after `hideTimer`), add:
  ```ts
  const cardRef = useRef<HTMLDivElement>(null);
  ```

- [ ] **Step 2: Attach `ref` to the preview card's inner `motion.div`**

  On line 398, change:
  ```tsx
  <motion.div
    className="w-64 rounded-lg shadow-md overflow-hidden cursor-pointer"
  ```
  To:
  ```tsx
  <motion.div
    ref={cardRef}
    className="w-64 rounded-lg shadow-md overflow-hidden cursor-pointer"
  ```

- [ ] **Step 3: Update the `onClick` handler on the preview card**

  On line 414, change:
  ```tsx
  onClick={() => setVideoModal(activeProject === 'shaders' ? SHADERS_VIDEO_SRC : TOOLS_VIDEO_SRC)}
  ```
  To:
  ```tsx
  onClick={() => {
    const rect = cardRef.current?.getBoundingClientRect();
    const src = activeProject === 'shaders' ? SHADERS_VIDEO_SRC : TOOLS_VIDEO_SRC;
    if (rect) {
      setVideoModal({ src, originRect: rect });
    } else {
      setVideoModal({ src, originRect: new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0) });
    }
  }}
  ```

  The fallback `DOMRect` at viewport center means if `cardRef` is somehow null, the clip starts fully collapsed at screen center — a graceful degradation rather than a broken state.

---

### Task 3: Update the modal JSX

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update the `VideoPlayerContent` src prop**

  On line 455, change:
  ```tsx
  src={videoModal}
  ```
  To:
  ```tsx
  src={videoModal.src}
  ```

- [ ] **Step 2: Update the backdrop `onClick` close handlers**

  There are two `onClick={() => setVideoModal(null)}` calls inside the modal (backdrop div on line 444, and the Plus button on line 462). Both use `setVideoModal(null)` which is already correct — no change needed.

- [ ] **Step 3: Replace the modal `motion.div` animation props**

  On lines 446–451, replace:
  ```tsx
  <motion.div
    initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    className="relative aspect-video w-[min(720px,90vw)]"
  >
  ```
  With:
  ```tsx
  <motion.div
    initial={{ clipPath: getInitialClipPath(videoModal.originRect), opacity: 1 }}
    animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1 }}
    exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
    transition={{
      clipPath: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
      opacity: { duration: 0 },
    }}
    className="relative aspect-video w-[min(720px,90vw)]"
  >
  ```

---

### Task 4: Verify and commit

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Run the dev server**

  ```bash
  npm run dev
  ```

- [ ] **Step 2: Visual verification checklist**

  Open the browser at `http://localhost:3000`:
  1. Hover "Shader Playground" — preview card appears above the word
  2. Click the card — modal should expand via clipPath from the card's position, NOT fade from center
  3. The expansion should feel snappy and directional, completing in ~400ms
  4. The corners should start rounded (8px) and end square
  5. Close the modal (click backdrop or X) — exit should fade + scale down as before (unchanged)
  6. Repeat with "UI Sound Lab" from a different scroll position — morph should originate from the correct location

- [ ] **Step 3: Commit**

  ```bash
  git add app/page.tsx
  git commit -m "feat: morph video modal entry from preview card using clipPath"
  ```
