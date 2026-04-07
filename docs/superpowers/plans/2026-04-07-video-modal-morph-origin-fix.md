# Video Modal Morph Origin Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `clipPath`-based modal entry animation with a `scale` + `x`/`y` + `borderRadius` approach so the modal morphs from the preview card's center rather than appearing to grow from its bottom edge.

**Architecture:** At click time, compute `scale` (card width / modal width), `offsetX` and `offsetY` (card center minus viewport center) from `cardRef.current.getBoundingClientRect()`. Store these in `videoModal` state. The modal `motion.div` starts at that scale and offset, then animates to `scale: 1, x: 0, y: 0`. Remove `getInitialClipPath` entirely.

**Tech Stack:** Next.js 15, Framer Motion (`motion/react`), TypeScript — all in `app/page.tsx`

---

## Files

- Modify: `app/page.tsx`

---

### Task 1: Update state type and click handler, remove `getInitialClipPath`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Remove `getInitialClipPath`**

  Delete lines 71–85 (the entire `getInitialClipPath` function):

  ```ts
  function getInitialClipPath(originRect: DOMRect): string {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mW = Math.min(720, vw * 0.9);
    const mH = mW * (9 / 16);
    const mLeft = (vw - mW) / 2;
    const mTop = (vh - mH) / 2;

    const top    = Math.max(0, (originRect.top    - mTop)      / mH * 100).toFixed(2);
    const left   = Math.max(0, (originRect.left   - mLeft)     / mW * 100).toFixed(2);
    const bottom = Math.max(0, (mTop + mH - originRect.bottom) / mH * 100).toFixed(2);
    const right  = Math.max(0, (mLeft + mW - originRect.right) / mW * 100).toFixed(2);

    return `inset(${top}% ${right}% ${bottom}% ${left}% round 8px)`;
  }
  ```

- [ ] **Step 2: Update `videoModal` state type**

  On line 92 (after removing the function, this line shifts up), change:
  ```ts
  const [videoModal, setVideoModal] = useState<{ src: string; initialClipPath: string } | null>(null);
  ```
  To:
  ```ts
  const [videoModal, setVideoModal] = useState<{ src: string; scale: number; offsetX: number; offsetY: number } | null>(null);
  ```

- [ ] **Step 3: Update the click handler on the preview card**

  Find the `onClick` on the card `motion.div` (the one with `ref={cardRef}`). Replace:
  ```tsx
  onClick={() => {
    const rect = cardRef.current?.getBoundingClientRect();
    const src = activeProject === 'shaders' ? SHADERS_VIDEO_SRC : TOOLS_VIDEO_SRC;
    const initialClipPath = rect
      ? getInitialClipPath(rect)
      : "inset(50% 50% 50% 50% round 8px)";
    clearTimeout(hideTimer.current);
    setActiveProject(null);
    setVideoModal({ src, initialClipPath });
  }}
  ```
  With:
  ```tsx
  onClick={() => {
    const rect = cardRef.current?.getBoundingClientRect();
    const src = activeProject === 'shaders' ? SHADERS_VIDEO_SRC : TOOLS_VIDEO_SRC;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const modalWidth = Math.min(720, vw * 0.9);
    const scale = rect ? rect.width / modalWidth : 0.97;
    const offsetX = rect ? (rect.left + rect.width / 2) - vw / 2 : 0;
    const offsetY = rect ? (rect.top + rect.height / 2) - vh / 2 : 0;
    clearTimeout(hideTimer.current);
    setActiveProject(null);
    setVideoModal({ src, scale, offsetX, offsetY });
  }}
  ```

  The fallback (`scale: 0.97, offsetX: 0, offsetY: 0`) gives a subtle fade-in from center if `cardRef` is somehow null — graceful degradation, not a broken state.

---

### Task 2: Update the modal `motion.div` animation props

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `initial`, `animate`, and `transition` on the modal `motion.div`**

  Find the modal `motion.div` (inside `{videoModal && (...)}`, after the backdrop `motion.div`). Replace:
  ```tsx
  <motion.div
    initial={{ clipPath: videoModal.initialClipPath }}
    animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
    exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
    transition={{
      clipPath: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
      opacity: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
      scale: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
      filter: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
    }}
    className="relative aspect-video w-[min(720px,90vw)]"
  >
  ```
  With:
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

---

### Task 3: Verify and commit

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Run the dev server**

  ```bash
  npm run dev
  ```

- [ ] **Step 2: Visual verification checklist**

  Open `http://localhost:3000`:
  1. Hover "Shader Playground" — preview card appears above the word
  2. Click the card — modal should expand from the card's center outward, NOT from the card's bottom edge
  3. The center of the expanding modal should stay aligned with where the card was during the entire 0.4s expansion
  4. The corners should start rounded (matching `rounded-lg`) and square off as the modal reaches full size
  5. Close the modal — exit should fade + scale down as before (unchanged)
  6. Repeat with "UI Sound Lab" — same quality from a different scroll/card position

- [ ] **Step 3: Commit**

  ```bash
  git add app/page.tsx
  git commit -m "fix: morph video modal from card center using scale+translate instead of clipPath"
  ```
