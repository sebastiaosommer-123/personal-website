# Job Experience Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a morphing expand interaction to each experience row — clicking it grows the hover rectangle vertically into a detail card (same width, height only), blurring the rest of the page around it.

**Architecture:** Each experience row in `AnimatedBackground` gets a `MorphingDialog` wrapper (motion-primitives). On click, a `motion.div` with `layoutId` morphs from the row's position/size to a fixed-positioned expanded card rendered in a portal at the same screen coordinates. Sibling page sections blur via animated `filter` props keyed to `selectedExp` state.

**Tech Stack:** motion/react v12 (`layoutId`, `AnimatePresence`), motion-primitives `morphing-dialog`, Lucide `X` icon, React `createPortal`, `useState`, `useRef`

---

## Files

| File | Change |
|---|---|
| `app/page.tsx` | Add `selectedExp` + `selectedExpRect` state, extend experience data, restructure experience map, blur sibling sections, extend Escape handler |
| `components/motion-primitives/morphing-dialog.tsx` | Created by CLI |

---

### Task 1: Create feature branch

- [ ] **Create and switch to branch**

```bash
git checkout -b job-experience-detail
```

Expected: `Switched to a new branch 'job-experience-detail'`

---

### Task 2: Install morphing-dialog

**Files:**
- Create: `components/motion-primitives/morphing-dialog.tsx`

- [ ] **Run the motion-primitives CLI**

```bash
cd /Users/sebsommer/temporary-portfolio && npx motion-primitives@latest add morphing-dialog
```

Expected: CLI prompts/confirms, creates `components/motion-primitives/morphing-dialog.tsx`

- [ ] **Read the generated file and note the exported API**

```bash
cat components/motion-primitives/morphing-dialog.tsx
```

Look for and note:
- Does `MorphingDialog` accept `open` / `onOpenChange` props? (controlled mode)
- Does `MorphingDialogTrigger` have a `style` prop?
- Does `MorphingDialogContainer` render via `createPortal`?
- Does `MorphingDialogClose` exist?

If `open`/`onOpenChange` are **not** exported, add them to the component now:

```tsx
// In MorphingDialog, change from uncontrolled to optionally controlled:
type MorphingDialogProps = {
  children: React.ReactNode;
  transition?: Transition;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function MorphingDialog({ children, transition, open: controlledOpen, onOpenChange }: MorphingDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (val: boolean) => {
    setInternalOpen(val);
    onOpenChange?.(val);
  };
  // rest of implementation unchanged
}
```

- [ ] **Commit**

```bash
git add components/motion-primitives/morphing-dialog.tsx
git commit -m "feat: add morphing-dialog motion primitive"
```

---

### Task 3: Extend experience data

**Files:**
- Modify: `app/page.tsx` lines 27–52

- [ ] **Replace the `experience` array with the extended version**

In `app/page.tsx`, replace the entire `experience` constant (lines 27–52) with:

```typescript
type ExperienceEntry = {
  company: string;
  role: string;
  period: string;
  logo: string;
  image?: string | null;
  description: string;
  highlights: string[];
  skills: string[];
};

const experience: ExperienceEntry[] = [
  {
    company: "Stealth AI Startup",
    role: "Sr. Product Designer",
    period: "2025 – Current",
    logo: "/assets/stealth-startup.svg",
    image: null,
    description:
      "Working as Founding Product Designer at a stealth AI startup, leading design across core product surfaces from 0 to 1 in close collaboration with engineering and product.",
    highlights: [
      "Designed the core product experience end-to-end from zero",
      "Established the design system and component library",
      "Collaborated directly with founders on product strategy and roadmap",
    ],
    skills: ["Product Design", "0→1 Design", "Design Systems", "User Research"],
  },
  {
    company: "HOP Design",
    role: "Senior Product Designer",
    period: "2023 – 2025",
    logo: "/assets/hop-design.svg",
    image: null,
    description:
      "Led end-to-end product design for a diverse client base, creating mobile apps, dashboards, and websites. Provided strategic guidance to two designers, ensuring alignment with project goals and user needs.",
    highlights: [
      'Shipped impactful features like "AI Caption" for Hashtag Expert and "Create Your Game" for Stepbet',
      "Redesigned the Padmé web dashboard, enhancing usability and accessibility",
      "Played a key role in delivering multiple browsers with Infinity Browsers",
    ],
    skills: [
      "Product Design",
      "UX/UI Design",
      "Interaction Design",
      "Web Design",
      "Prototyping",
      "User Research",
    ],
  },
  {
    company: "Tempest",
    role: "Sr. Product Designer",
    period: "2022 – 23'",
    logo: "/assets/tempest.svg",
    image: null,
    description:
      "Shaped the product design direction for a fast-growing startup, owning core user flows and working closely with engineering to ship features at pace.",
    highlights: [
      "Owned design for the onboarding and activation flows",
      "Ran user interviews and translated findings into actionable design improvements",
      "Contributed to measurable improvements in key activation metrics",
    ],
    skills: ["Product Design", "UX Research", "Interaction Design", "Prototyping"],
  },
  {
    company: "HOP Studio",
    role: "UX/UI Designer",
    period: "2020 – 22'",
    logo: "/assets/44-studio.svg",
    image: null,
    description:
      "Designed interfaces for client projects spanning e-commerce, fintech, and SaaS products. Developed a strong foundation in design systems and component-based thinking.",
    highlights: [
      "Delivered 10+ end-to-end projects across industries",
      "Built and maintained a shared Figma component library used across all projects",
      "Mentored junior designers on interaction principles and Figma workflows",
    ],
    skills: ["UI Design", "UX Design", "Design Systems", "Figma"],
  },
];
```

- [ ] **Run dev to confirm no TypeScript errors**

```bash
npm run dev
```

Expected: Server starts, no red type errors in terminal.

- [ ] **Commit**

```bash
git add app/page.tsx
git commit -m "feat: add description, highlights, and skills to experience data"
```

---

### Task 4: Add state for selected experience

**Files:**
- Modify: `app/page.tsx`

- [ ] **Add two new state variables after the existing state declarations (around line 70)**

After `const [isTouch, setIsTouch] = useState(false);`, add:

```typescript
const [selectedExp, setSelectedExp] = useState<string | null>(null);
const [selectedExpRect, setSelectedExpRect] = useState<DOMRect | null>(null);
const expTriggerRefs = useRef<Map<string, HTMLElement>>(new Map());
```

- [ ] **Extend the Escape key useEffect to close the experience card**

The existing useEffect at line ~127 handles Escape for video modal and surfOpen. Update the dependency array and add the selectedExp case:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (videoModal) closeModal();
      else if (surfOpen) setSurfOpen(false);
      else if (selectedExp) setSelectedExp(null);
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [surfOpen, videoModal, selectedExp]);
```

- [ ] **Run dev to confirm no errors**

```bash
npm run dev
```

Expected: App loads fine, no console errors.

- [ ] **Commit**

```bash
git add app/page.tsx
git commit -m "feat: add selectedExp state and escape key handler for experience detail"
```

---

### Task 5: Wire MorphingDialog and build expanded card

**Files:**
- Modify: `app/page.tsx`

- [ ] **Add the MorphingDialog import at the top of the file**

Add to the existing imports block:

```typescript
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
} from "@/components/motion-primitives/morphing-dialog";
```

Note: Import names depend on what the CLI generated. Adjust to match the actual exports.

- [ ] **Replace the experience section (lines ~198–245) with the new implementation**

Replace the entire `{/* Experience */}` block with:

```tsx
{/* Experience */}
<motion.div
  initial={{ opacity: 0, filter: "blur(8px)" }}
  animate={{
    opacity: selectedExp ? 0.3 : 1,
    filter: selectedExp ? "blur(8px)" : "blur(0px)",
  }}
  transition={{
    duration: 0.4,
    ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    delay: selectedExp !== null ? 0 : 0.32,
  }}
  className="flex flex-col -mx-3"
>
  <AnimatedBackground
    enableHover={!isTouch && !selectedExp}
    className="rounded-xl bg-black/[0.04] dark:bg-white/[0.06]"
    transition={{ type: "spring", stiffness: 400, damping: 35 }}
  >
    {experience.map((exp) => (
      <div
        key={exp.company}
        data-id={exp.company}
        className="w-full"
        ref={(el) => {
          if (el) expTriggerRefs.current.set(exp.company, el);
          else expTriggerRefs.current.delete(exp.company);
        }}
      >
        <MorphingDialog
          open={selectedExp === exp.company}
          onOpenChange={(open) => {
            if (open) {
              const el = expTriggerRefs.current.get(exp.company);
              if (el) setSelectedExpRect(el.getBoundingClientRect());
              setSelectedExp(exp.company);
            } else {
              setSelectedExp(null);
            }
          }}
          transition={{
            duration: 0.4,
            ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
          }}
        >
          {/* ── Collapsed row (trigger) ── */}
          <MorphingDialogTrigger
            className="w-full cursor-pointer block"
            style={{ background: "transparent" }}
          >
            <div className="flex w-full items-center justify-between px-3 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="shrink-0 overflow-hidden flex items-center justify-center"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10.36,
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exp.logo}
                    alt={exp.company}
                    width={38}
                    height={38}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0.5" style={{ width: 184 }}>
                  <span
                    className="font-medium text-base"
                    style={{ lineHeight: 1.3, color: "var(--color-fg)" }}
                  >
                    {exp.role}
                  </span>
                  <span
                    className="text-sm"
                    style={{ lineHeight: 1.3, color: "var(--color-fg)", opacity: 0.7 }}
                  >
                    {exp.company}
                  </span>
                </div>
              </div>
              <span
                className="text-sm text-right"
                style={{
                  lineHeight: 1.643,
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--color-fg)",
                }}
              >
                {exp.period}
              </span>
            </div>
          </MorphingDialogTrigger>

          {/* ── Expanded card (portal) ── */}
          <MorphingDialogContainer>
            {/* Backdrop: click outside to close */}
            <div
              className="fixed inset-0 z-[49]"
              onClick={() => setSelectedExp(null)}
            />

            <MorphingDialogContent
              style={{
                position: "fixed",
                top: selectedExpRect?.top ?? 0,
                left: selectedExpRect?.left ?? 0,
                width: selectedExpRect?.width ?? 0,
                zIndex: 50,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: "var(--color-surface)",
                boxShadow:
                  "0px 8px 32px rgba(0,0,0,0.12), 0px 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {/* Image area — red placeholder until real image is provided */}
              <div
                className="relative w-full"
                style={{ height: 241, backgroundColor: "#FF0000", flexShrink: 0 }}
              >
                {/* Use MorphingDialogClose if it supports asChild, otherwise just use onClick */}
                <MorphingDialogClose asChild>
                  <button
                    type="button"
                    className="absolute right-3 top-3 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors duration-150 cursor-pointer"
                    onClick={() => setSelectedExp(null)}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </MorphingDialogClose>
                {/* Fallback if MorphingDialogClose doesn't export / doesn't support asChild:
                <button
                  type="button"
                  className="absolute right-3 top-3 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors duration-150 cursor-pointer"
                  onClick={() => setSelectedExp(null)}
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                */}
              </div>

              {/* Content area */}
              <motion.div
                className="flex flex-col gap-4 px-4 pt-4 pb-4"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{
                  duration: 0.25,
                  ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
                  delay: 0.15,
                }}
              >
                {/* Header row (role + company + period) */}
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="shrink-0 overflow-hidden flex items-center justify-center"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10.36,
                        backgroundColor: "var(--color-surface)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={exp.logo}
                        alt={exp.company}
                        width={38}
                        height={38}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5" style={{ width: 184 }}>
                      <span
                        className="font-medium text-base"
                        style={{ lineHeight: 1.3, color: "var(--color-fg)" }}
                      >
                        {exp.role}
                      </span>
                      <span
                        className="text-sm"
                        style={{ lineHeight: 1.3, color: "var(--color-fg)", opacity: 0.7 }}
                      >
                        {exp.company}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-sm text-right"
                    style={{
                      lineHeight: 1.643,
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--color-fg)",
                    }}
                  >
                    {exp.period}
                  </span>
                </div>

                {/* Description */}
                <p
                  className="text-base"
                  style={{ lineHeight: 1.4, color: "var(--color-fg)", opacity: 0.7 }}
                >
                  {exp.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-col gap-1">
                  <span
                    className="font-medium text-base"
                    style={{ lineHeight: 1.3, color: "var(--color-fg)" }}
                  >
                    Highlights
                  </span>
                  <div
                    className="flex flex-col gap-1"
                    style={{ color: "var(--color-fg)", opacity: 0.7 }}
                  >
                    {exp.highlights.map((h) => (
                      <p key={h} className="text-base" style={{ lineHeight: 1.4 }}>
                        – {h}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Skill chips */}
                <div className="flex flex-wrap gap-2">
                  {exp.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-sm inline-flex items-center px-[10px]"
                      style={{
                        height: 30,
                        borderRadius: 50,
                        backgroundColor: "#EEEFF1",
                        border: "1px solid #D5D5D5",
                        color: "#18191C",
                        lineHeight: 1,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            </MorphingDialogContent>
          </MorphingDialogContainer>
        </MorphingDialog>
      </div>
    ))}
  </AnimatedBackground>
</motion.div>
```

- [ ] **Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000`:
- Hover experience rows → gray highlight slides (unchanged)
- Click a row → card morphs, grows taller, stays at same horizontal position
- X button closes the card

If `MorphingDialog` does not support `open`/`onOpenChange` in controlled mode, replace with uncontrolled and wire clicks manually:

```tsx
// Uncontrolled fallback: remove open/onOpenChange props,
// add onClick directly to MorphingDialogTrigger's inner content div
// and add onClick to MorphingDialogClose + backdrop div
// No external selectedExp sync needed — use the backdrop/X to close.
// THEN add a separate effect to track open state via a ref if blur is needed.
```

- [ ] **Commit**

```bash
git add app/page.tsx
git commit -m "feat: add morphing experience detail card with MorphingDialog"
```

---

### Task 6: Add blur to all sibling sections

**Files:**
- Modify: `app/page.tsx` — name/subtitle section, bio section, testimonials, socials

- [ ] **Change the name section to blur when selectedExp is set**

Find the `{/* Name + Title */}` block (around line 142). Change it from:

```tsx
<div className="flex flex-col gap-0.5 w-[210px]">
  <motion.h1 {...block(0)} ...>
  <motion.p initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 0.54, ... }} ...>
</div>
```

To a wrapping motion.div that applies blur when selectedExp is set:

```tsx
<motion.div
  className="flex flex-col gap-0.5 w-[210px]"
  animate={{
    opacity: selectedExp ? 0.3 : 1,
    filter: selectedExp ? "blur(8px)" : "blur(0px)",
  }}
  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
>
  <motion.h1 {...block(0)} className="font-medium text-base" style={{ lineHeight: 1.3, color: "var(--color-fg)" }}>
    Sebastião Sommer
  </motion.h1>
  <motion.p
    initial={{ opacity: 0, filter: "blur(8px)" }}
    animate={{ opacity: 0.54, filter: "blur(0px)" }}
    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
    className="text-sm"
    style={{ lineHeight: 1.3, color: "var(--color-fg)" }}
  >
    Founding Product Designer
  </motion.p>
</motion.div>
```

- [ ] **Change the bio section to blur when selectedExp is set**

Find the `{/* Bio */}` motion.div (around line 164). Change its `animate` prop from spreading `{...block(0.16)}` to:

```tsx
<motion.div
  initial={{ opacity: 0, filter: "blur(8px)" }}
  animate={{
    opacity: selectedExp ? 0.3 : 1,
    filter: selectedExp ? "blur(8px)" : "blur(0px)",
  }}
  transition={{
    duration: 0.4,
    ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    delay: selectedExp !== null ? 0 : 0.16,
  }}
>
```

- [ ] **Change the testimonials section to blur when selectedExp is set**

Find `{/* Testimonials */}` (around line 248). Change from `{...block(0.40)}` to:

```tsx
<motion.div
  initial={{ opacity: 0, filter: "blur(8px)" }}
  animate={{
    opacity: selectedExp ? 0.3 : 1,
    filter: selectedExp ? "blur(8px)" : "blur(0px)",
  }}
  transition={{
    duration: 0.4,
    ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    delay: selectedExp !== null ? 0 : 0.40,
  }}
>
  <Testimonials />
</motion.div>
```

- [ ] **Change the socials section to blur when selectedExp is set**

Find `{/* Social links */}` (around line 253). Change from `{...block(0.48)}` to:

```tsx
<motion.div
  initial={{ opacity: 0, filter: "blur(8px)" }}
  animate={{
    opacity: selectedExp ? 0.3 : 1,
    filter: selectedExp ? "blur(8px)" : "blur(0px)",
  }}
  transition={{
    duration: 0.4,
    ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    delay: selectedExp !== null ? 0 : 0.48,
  }}
  className="flex justify-between gap-6 mt-2"
>
  {socials.map(...)}
</motion.div>
```

- [ ] **Verify blur in browser**

```bash
npm run dev
```

Check:
- Click a row → name, bio, testimonials, socials all blur to ~30% opacity
- Card stays sharp (it's in a portal, above the blurred content)
- Closing the card → blur lifts smoothly

- [ ] **Commit**

```bash
git add app/page.tsx
git commit -m "feat: blur sibling sections when experience detail card is open"
```

---

### Task 7: End-to-end verification

- [ ] **Run dev server**

```bash
npm run dev
```

- [ ] **Golden path**

1. Hover experience rows — gray highlight slides between items
2. Click "Sr. Product Designer / Stealth AI Startup" — card morphs, same width, grows taller
3. Other sections blur smoothly to ~30% opacity
4. Image placeholder is red (full width, 241px tall)
5. X button in top-right of image closes the card
6. Press Escape — card closes, blur lifts

- [ ] **Edge cases**

7. Open card A → close → open card B — works without stuck blur
8. On mobile viewport (≤768px): hover disabled, click still opens card
9. No two cards open simultaneously

- [ ] **Type check**

```bash
npm run build
```

Expected: Build completes with no TypeScript errors.

- [ ] **Final commit**

```bash
git add app/page.tsx
git commit -m "feat: complete job experience detail morphing card"
```
