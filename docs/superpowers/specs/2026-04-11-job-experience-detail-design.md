# Job Experience Detail Popup — Design Spec

## Context

When a user taps a row in the experience section, a popup card appears showing the full detail for that job: a product image placeholder, description, highlights, and skill tags. This gives visitors richer context without leaving the page. The morph-from-row animation will be added in a follow-up; this spec covers the layout and static modal first (Option A: center fade+scale).

---

## Data

Extend the `experience` array in `app/page.tsx` with three new fields (same placeholder values for all jobs for now):

```ts
{
  company: string;
  role: string;
  period: string;
  logo: string;
  description: string;       // NEW
  highlights: string[];      // NEW
  skills: string[];          // NEW
}
```

Placeholder values (identical for every job until real content is added):
- `description`: "Led end-to-end product design for a diverse client base, creating mobile apps, dashboards, and websites. Provided strategic guidance to designers, ensuring alignment with project goals and user needs."
- `highlights`: ["Shipped impactful features across multiple client products", "Redesigned core dashboards, enhancing usability and accessibility", "Played a key role in delivering multiple high-impact projects"]
- `skills`: ["Product Design", "UX/UI Design", "Interaction Design", "Web Design", "Prototyping", "User Research"]

---

## Component

New file: `components/job-experience-modal.tsx`

Accepts props:
```ts
interface JobExperienceModalProps {
  experience: ExperienceItem | null;
  onClose: () => void;
}
```

Rendered via `AnimatePresence` at the bottom of the `Home` component in `app/page.tsx`, above all other overlays (`z-[10000]`).

---

## State (page.tsx)

```ts
const [selectedExperience, setSelectedExperience] = useState<ExperienceItem | null>(null);
```

- Each experience row gets `onClick={() => setSelectedExperience(exp)}`
- Backdrop click and close button call `setSelectedExperience(null)`

---

## Card Styling

Matches the existing hover rectangle exactly:

| Property       | Value                                         |
|----------------|-----------------------------------------------|
| Width          | `w-full max-w-[469px]`                        |
| Background     | `bg-black/[0.04] dark:bg-white/[0.06]`        |
| Border radius  | `rounded-xl` (12px)                           |
| Overflow       | `overflow-hidden` (clips image to top corners)|

The card is centered in the viewport: `fixed inset-0 flex items-center justify-center`.

---

## Card Content (top → bottom)

1. **Image placeholder** — `w-full h-[200px] bg-black/[0.06] dark:bg-white/[0.06]` (rounded top via parent `overflow-hidden`)
2. **Header row** — `flex justify-between items-center px-4 pt-4`
   - Left: logo (38×38, `borderRadius: 10.36`, `backgroundColor: var(--color-surface)`) + column of role (Inter 500 16px, `var(--color-fg)`) + company (14px, 70% opacity)
   - Right: period (14px, tabular nums, `var(--color-fg)`)
3. **Description** — `px-4 pt-2`, 16px, line-height 1.4, 70% opacity, `var(--color-fg)`
4. **Highlights** — `px-4 pt-4`
   - Label: "Highlights" — Inter 500 16px, `var(--color-fg)`
   - Bullets: `mt-1`, same text style as description (16px, 70% opacity), each prefixed with `–`
5. **Skills tags** — `px-4 pt-4 pb-4`, wrapping flex row, `gap-2`
   - Each tag: `rounded-full bg-black/[0.06] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 h-[30px] px-[10px] text-sm`
6. **Close button** — `absolute top-3 right-3`, `X` icon from Lucide (already imported in page.tsx), size 16, wrapped in a `<button>` with `rounded-full p-1.5 bg-black/[0.06] hover:bg-black/10 transition-colors`

---

## Backdrop

```tsx
<motion.div
  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000]"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  onClick={onClose}
/>
```

---

## Animation

```tsx
// Card
initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
animate={{ opacity: 1, scale: 1,    filter: "blur(0px)" }}
exit={{    opacity: 0, scale: 0.97, filter: "blur(8px)" }}
transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
```

Exit uses `duration: 0.2`.

---

## Files Modified

| File | Change |
|------|--------|
| `app/page.tsx` | Add `selectedExperience` state, onClick handlers, extend `experience` data, render `<JobExperienceModal>` |
| `components/job-experience-modal.tsx` | New file — modal component |

---

## Verification

1. Run `npm run dev`, open the portfolio in a browser
2. Hover over experience rows — existing hover rectangle still works
3. Click any row — popup appears centered, backdrop dims the page
4. Card shows: image placeholder, header matching the row's job, description, highlights, tags
5. Close button (X, top-right) dismisses the popup
6. Clicking the backdrop dismisses the popup
7. Enter/exit animations are smooth (scale + fade + blur)
8. Works correctly in both light and dark mode
9. Layout is correct at narrow viewport widths (mobile)
