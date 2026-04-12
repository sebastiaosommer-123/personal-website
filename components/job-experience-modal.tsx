"use client";

import { motion, AnimatePresence, useAnimation } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  logo: string;
  description: string;
  highlights: string[];
  skills: string[];
}

export interface OriginRects {
  row: DOMRect;
  logo: DOMRect;
  role: DOMRect;
  company: DOMRect;
  period: DOMRect;
}

interface JobExperienceModalProps {
  experience: ExperienceItem | null;
  originRects?: OriginRects | null;
  onClose: () => void;
}

interface ModalContentProps {
  experience: ExperienceItem;
  originRects: OriginRects | null | undefined;
  onClose: () => void;
}

function ModalContent({ experience, originRects, onClose }: ModalContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const containerControls = useAnimation();
  const headerControls = useAnimation();
  const imageControls = useAnimation();
  const bodyControls = useAnimation();
  const backdropControls = useAnimation();
  const isExitingRef = useRef(false);
  const handleCloseRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    backdropControls.start({
      opacity: 1,
      transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
    });
  }, []);

  useLayoutEffect(() => {
    if (!originRects || !containerRef.current || !logoRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const logoTargetRect = logoRef.current.getBoundingClientRect();

    const topClip = Math.max(0, originRects.row.top - containerRect.top);
    const bottomClip = Math.max(0, containerRect.bottom - originRects.row.bottom);
    const dy = originRects.logo.top - logoTargetRect.top;

    const isDark = document.documentElement.classList.contains("dark");
    const cardBg = isDark ? "#1F1F21" : "#EEEFF1";
    const modalBg = isDark ? "#111113" : "#FFFFFF";

    containerControls.set({
      clipPath: `inset(${topClip}px 0px ${bottomClip}px 0px round 12px)`,
      backgroundColor: cardBg,
    });
    headerControls.set({ y: dy });
    imageControls.set({ opacity: 0, filter: "blur(4px)" });
    bodyControls.set({ opacity: 0, filter: "blur(4px)" });

    const raf = requestAnimationFrame(() => {
      containerControls.start({
        clipPath: "inset(0px 0px 0px 0px round 12px)",
        backgroundColor: modalBg,
        transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] },
      });
      headerControls.start({
        y: 0,
        transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] },
      });
      imageControls.start({
        opacity: 1,
        filter: "blur(0px)",
        transition: { delay: 0.2, duration: 0.15, ease: [0.23, 1, 0.32, 1] },
      });
      bodyControls.start({
        opacity: 1,
        filter: "blur(0px)",
        transition: { delay: 0.25, duration: 0.15, ease: [0.23, 1, 0.32, 1] },
      });
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;
    const bodyWidth = document.body.getBoundingClientRect().width;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = `${bodyWidth}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleClose = async () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    if (!originRects || !containerRef.current || !logoRef.current) {
      onClose();
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const logoTargetRect = logoRef.current.getBoundingClientRect();
    const topClip = Math.max(0, originRects.row.top - containerRect.top);
    const bottomClip = Math.max(0, containerRect.bottom - originRects.row.bottom);
    const dy = originRects.logo.top - logoTargetRect.top;

    const transition = { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const };

    await Promise.all([
      backdropControls.start({ opacity: 0, transition }),
      containerControls.start({
        clipPath: `inset(${topClip}px 0px ${bottomClip}px 0px round 12px)`,
        transition,
      }),
      headerControls.start({ y: dy, transition }),
      imageControls.start({ opacity: 0, filter: "blur(4px)", transition }),
      bodyControls.start({ opacity: 0, filter: "blur(4px)", transition }),
    ]);

    onClose();
  };

  handleCloseRef.current = handleClose;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000]"
        initial={{ opacity: 0 }}
        animate={backdropControls}
        onClick={handleClose}
      />

      {/* Card wrapper — handles click-outside-to-close; pointer-events-auto so touch scroll works on mobile */}
      <div className="fixed inset-0 z-[10001] flex items-start justify-center px-3 py-6 overflow-y-auto" onClick={handleClose}>
        <motion.div
          ref={containerRef}
          animate={containerControls}
          className="relative w-full max-w-[493px] rounded-xl overflow-hidden pointer-events-auto my-auto"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 rounded-full p-1.5 bg-black/[0.06] hover:bg-black/10 dark:bg-white/[0.06] dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Image placeholder — transparent during clip expansion, fades in after */}
          <motion.div
            className="w-full h-[200px] bg-black/[0.06] dark:bg-white/[0.06]"
            animate={imageControls}
          />

          {/* Header row — travels from list position to modal header via translateY */}
          <motion.div
            animate={headerControls}
            className="flex items-center justify-between px-4 pt-4"
          >
            <div className="flex items-center gap-3">
              <div
                ref={logoRef}
                data-morph="logo"
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
                  data-morph="role"
                  className="font-medium text-base"
                  style={{ lineHeight: 1.3, color: "var(--color-fg)" }}
                >
                  {experience.role}
                </span>
                <span
                  data-morph="company"
                  className="text-sm"
                  style={{ lineHeight: 1.3, color: "var(--color-fg)", opacity: 0.7 }}
                >
                  {experience.company}
                </span>
              </div>
            </div>
            <span
              data-morph="period"
              className="text-sm text-right"
              style={{
                lineHeight: 1.643,
                fontVariantNumeric: "tabular-nums",
                color: "var(--color-fg)",
              }}
            >
              {experience.period}
            </span>
          </motion.div>

          {/* Body content — fades in after clip expansion completes */}
          <motion.div animate={bodyControls}>
            <p
              className="px-4 pt-2 text-base"
              style={{ lineHeight: 1.4, color: "var(--color-fg)", opacity: 0.7 }}
            >
              {experience.description}
            </p>

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
        </motion.div>
      </div>
    </>
  );
}

export function JobExperienceModal({ experience, originRects, onClose }: JobExperienceModalProps) {
  return (
    <AnimatePresence>
      {experience && (
        <ModalContent
          key={experience.company}
          experience={experience}
          originRects={originRects}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
