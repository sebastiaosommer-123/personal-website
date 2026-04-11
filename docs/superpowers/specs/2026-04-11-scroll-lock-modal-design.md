# Spec: Scroll Lock When Experience Modal Is Open

## Problem

When the experience detail modal is open, the user can still scroll the background page. Only the modal content should scroll.

## Solution

Add a `useEffect` inside `ModalContent` (the inner component of `JobExperienceModal`) that locks `document.body` scroll on mount and restores it on unmount.

```ts
useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => { document.body.style.overflow = ''; };
}, []);
```

The modal container already has `overflow-y-auto`, so internal scrolling works without any additional changes.

## Scope

- **File changed:** `components/job-experience-modal.tsx` — one `useEffect` added to `ModalContent`
- **No scrollbar-width compensation needed:** content is `max-w-[469px]` centered; the surrounding empty space absorbs any scrollbar disappearance without visible layout shift
- **No new files or hooks:** one modal, one use case — a dedicated `useScrollLock` hook would be over-engineering

## Behaviour

| State | Body overflow | Modal container |
|---|---|---|
| Modal closed | `''` (default) | not rendered |
| Modal open | `'hidden'` | `overflow-y-auto` |
| Modal closes | restored to `''` | unmounts |

## Verification

1. Open the portfolio and scroll to the bottom of the page
2. Click an experience row — modal opens; background page should no longer scroll
3. Scroll within the modal — content scrolls normally
4. Close the modal — background page scrolls again from where it was
5. Test on mobile (touch): same behaviour
