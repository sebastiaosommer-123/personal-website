# Job Experience Detail Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user taps an experience row, a popup card appears with full job detail (image placeholder, header, description, highlights, skill tags) and dismisses via close button or backdrop click.

**Architecture:** A new `JobExperienceModal` component holds all modal UI and animation logic. State (`selectedExperience`) lives in `page.tsx`. The `experience` data array is extended with description/highlights/skills placeholder fields. The modal renders via `AnimatePresence` at the root of the page component.

**Tech Stack:** Next.js, `motion/react` (AnimatePresence, motion.div), Lucide (`X` icon), Tailwind CSS

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `components/job-experience-modal.tsx` | **Create** | Modal UI, backdrop, animations, close button |
| `app/page.tsx` | **Modify** | Add state, extend data, add onClick handlers, render modal |

---

### Task 1: Create the JobExperienceModal component

**Files:**
- Create: `components/job-experience-modal.tsx`

- [ ] **Step 1: Create the file with this exact content**

```tsx
"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { X } from "lucide-react";

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  logo: string;
  description: string;
  highlights: string[];
  skills: string[];
}

interface JobExperienceModalProps {
  experience: ExperienceItem | null;
  onClose: () => void;
}

export function JobExperienceModal({ experience, onClose }: JobExperienceModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (experience) {
      document.addEventListener("keydown", handleKey);
    }
    return () => document.removeEventListener("keydown", handleKey);
  }, [experience, onClose]);

  return (
    <AnimatePresence>
      {experience && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
          />

          {/* Card wrapper — centers card, passes pointer events through */}
          <div className="fixed inset-0 z-[10001] flex items-center justify-center px-3 pointer-events-none">
            <motion.div
              className="relative w-full max-w-[469px] rounded-xl bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden pointer-events-auto"
              initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 rounded-full p-1.5 bg-black/[0.06] hover:bg-black/10 dark:bg-white/[0.06] dark:hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Image placeholder */}
              <div className="w-full h-[200px] bg-black/[0.06] dark:bg-white/[0.08]" />

              {/* Header row */}
              <div className="flex items-center justify-between px-4 pt-4">
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
                      src={experience.logo}
                      alt={experience.company}
                      width={38}
                      height={38}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="font-medium text-base"
                      style={{ lineHeight: 1.3, color: "var(--color-fg)" }}
                    >
                      {experience.role}
                    </span>
                    <span
                      className="text-sm"
                      style={{ lineHeight: 1.3, color: "var(--color-fg)", opacity: 0.7 }}
                    >
                      {experience.company}
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
                  {experience.period}
                </span>
              </div>

              {/* Description */}
              <p
                className="px-4 pt-3 text-base"
                style={{ lineHeight: 1.4, color: "var(--color-fg)", opacity: 0.7 }}
              >
                {experience.description}
              </p>

              {/* Highlights */}
              <div className="px-4 pt-4">
                <span
                  className="font-medium text-base"
                  style={{ color: "var(--color-fg)" }}
                >
                  Highlights
                </span>
                <div className="mt-1 flex flex-col gap-1">
                  {experience.highlights.map((h, i) => (
                    <p
                      key={i}
                      className="text-base"
                      style={{ lineHeight: 1.4, color: "var(--color-fg)", opacity: 0.7 }}
                    >
                      – {h}
                    </p>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="px-4 pt-4 pb-4 flex flex-wrap gap-2">
                {experience.skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center rounded-full bg-black/[0.06] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-sm px-[10px]"
                    style={{ height: 30, color: "var(--color-fg)" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify the file exists**

```bash
ls components/job-experience-modal.tsx
```

Expected: file listed with no error.

---

### Task 2: Extend experience data and add state in page.tsx

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the import for JobExperienceModal and ExperienceItem at the top of page.tsx**

Find the existing import block (around line 1–19). Add this line after the existing imports:

```ts
import { JobExperienceModal, type ExperienceItem } from "@/components/job-experience-modal";
```

- [ ] **Step 2: Replace the `experience` array with the extended version**

Find the existing `experience` array (lines 27–52) and replace it entirely with:

```ts
const experience: ExperienceItem[] = [
  {
    company: "Stealth AI Startup",
    role: "Sr. Product Designer",
    period: "2025 – Current",
    logo: "/assets/stealth-startup.svg",
    description:
      "Led end-to-end product design for a diverse client base, creating mobile apps, dashboards, and websites. Provided strategic guidance to designers, ensuring alignment with project goals and user needs.",
    highlights: [
      "Shipped impactful features across multiple client products",
      "Redesigned core dashboards, enhancing usability and accessibility",
      "Played a key role in delivering multiple high-impact projects",
    ],
    skills: ["Product Design", "UX/UI Design", "Interaction Design", "Web Design", "Prototyping", "User Research"],
  },
  {
    company: "HOP Design",
    role: "Sr. Product Designer",
    period: "2023 – 25'",
    logo: "/assets/hop-design.svg",
    description:
      "Led end-to-end product design for a diverse client base, creating mobile apps, dashboards, and websites. Provided strategic guidance to designers, ensuring alignment with project goals and user needs.",
    highlights: [
      "Shipped impactful features across multiple client products",
      "Redesigned core dashboards, enhancing usability and accessibility",
      "Played a key role in delivering multiple high-impact projects",
    ],
    skills: ["Product Design", "UX/UI Design", "Interaction Design", "Web Design", "Prototyping", "User Research"],
  },
  {
    company: "Tempest",
    role: "Sr. Product Designer",
    period: "2022 – 23'",
    logo: "/assets/tempest.svg",
    description:
      "Led end-to-end product design for a diverse client base, creating mobile apps, dashboards, and websites. Provided strategic guidance to designers, ensuring alignment with project goals and user needs.",
    highlights: [
      "Shipped impactful features across multiple client products",
      "Redesigned core dashboards, enhancing usability and accessibility",
      "Played a key role in delivering multiple high-impact projects",
    ],
    skills: ["Product Design", "UX/UI Design", "Interaction Design", "Web Design", "Prototyping", "User Research"],
  },
  {
    company: "HOP Studio",
    role: "UX/UI Designer",
    period: "2020 – 22'",
    logo: "/assets/44-studio.svg",
    description:
      "Led end-to-end product design for a diverse client base, creating mobile apps, dashboards, and websites. Provided strategic guidance to designers, ensuring alignment with project goals and user needs.",
    highlights: [
      "Shipped impactful features across multiple client products",
      "Redesigned core dashboards, enhancing usability and accessibility",
      "Played a key role in delivering multiple high-impact projects",
    ],
    skills: ["Product Design", "UX/UI Design", "Interaction Design", "Web Design", "Prototyping", "User Research"],
  },
];
```

- [ ] **Step 3: Add selectedExperience state inside the Home component**

Find the existing `useState` calls inside the `Home` component (around line 60–80). Add this line alongside the other state declarations:

```ts
const [selectedExperience, setSelectedExperience] = useState<ExperienceItem | null>(null);
```

- [ ] **Step 4: Add onClick to each experience row**

Find the `<div key={exp.company} data-id={exp.company} className="w-full cursor-pointer">` element inside the `experience.map(...)` block. Add an `onClick` handler:

```tsx
<div
  key={exp.company}
  data-id={exp.company}
  className="w-full cursor-pointer"
  onClick={() => setSelectedExperience(exp)}
>
```

- [ ] **Step 5: Render JobExperienceModal at the bottom of the JSX return**

Find the closing `</div>` tag at the very end of the `return (...)` in the `Home` component. Add `<JobExperienceModal>` just before that closing tag:

```tsx
        <JobExperienceModal
          experience={selectedExperience}
          onClose={() => setSelectedExperience(null)}
        />
      </div>
    </>
  );
```

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx components/job-experience-modal.tsx
git commit -m "feat: add job experience detail popup"
```

---

### Task 3: Verify visually

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser.

- [ ] **Step 2: Check the experience section still works**

Hover over experience rows — the animated background highlight should still appear on desktop.

- [ ] **Step 3: Click a row and verify the popup**

Click any experience row. Verify:
- Backdrop dims the page with a blur effect
- Card appears centered with `rounded-xl`, matches the hover rectangle background
- Card shows: gray image placeholder at top, close button (X) top-right, header with logo/role/company/period, description, "Highlights" section, skill tags along the bottom

- [ ] **Step 4: Verify close behaviors**

- Click the X button → popup dismisses with fade+blur exit animation
- Click the backdrop → popup dismisses
- Press Escape → popup dismisses

- [ ] **Step 5: Check dark mode**

Toggle dark mode. Verify the card background and tags render correctly in dark mode.

- [ ] **Step 6: Check mobile layout**

Narrow the browser to 375px width. Verify the card fits within the viewport with `px-3` side padding and no horizontal overflow.
