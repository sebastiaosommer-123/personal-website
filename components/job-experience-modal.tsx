"use client";

import { motion, AnimatePresence, useAnimation, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  logo: string;
  description: React.ReactNode;
  highlights: string[];
  image?: string;
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
  onCloseStart?: () => void;
  onExitComplete?: () => void;
}

interface ModalContentProps {
  experience: ExperienceItem;
  originRects: OriginRects | null | undefined;
  onClose: () => void;
  onCloseStart?: () => void;
}

function ModalContent({ experience, originRects, onClose, onCloseStart }: ModalContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const containerControls = useAnimation();
  const headerControls = useAnimation();
  const imageControls = useAnimation();
  const bodyControls = useAnimation();
  const highlightsControls = useAnimation();
  const backdropControls = useAnimation();
  const closeButtonControls = useAnimation();
  const prefersReducedMotion = useReducedMotion();
  const isExitingRef = useRef(false);
  const handleCloseRef = useRef<() => void>(() => {});
  const clipStateRef = useRef<{ topClip: number; bottomClip: number; leftClip: number; rightClip: number; containerDy: number; dy: number } | null>(null);

  useLayoutEffect(() => {
    backdropControls.start({
      opacity: 1,
      transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
    });
  }, []);

  useLayoutEffect(() => {
    if (!originRects || !containerRef.current || !logoRef.current) return;

    let rafId: number | undefined;
    let cancelled = false;

    if (prefersReducedMotion) {
      containerControls.set({ opacity: 0 });
      imageControls.set({ opacity: 0 });
      bodyControls.set({ opacity: 0 });
      highlightsControls.set({ opacity: 0 });

      const run = () => {
        if (cancelled) return;
        rafId = requestAnimationFrame(() => {
          const t = { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const };
          containerControls.start({ opacity: 1, transition: t });
          closeButtonControls.start({ opacity: 1, filter: "blur(0px)", transition: t });
          imageControls.start({ opacity: 1, transition: t });
          bodyControls.start({ opacity: 1, transition: t });
          highlightsControls.start({ opacity: 1, transition: t });
        });
      };

      const logoImgEl = logoRef.current.querySelector('img') as HTMLImageElement | null;
      if (logoImgEl) {
        logoImgEl.decode().then(run).catch(run);
      } else {
        run();
      }
    } else {
      const containerRect = containerRef.current.getBoundingClientRect();
      const logoTargetRect = logoRef.current.getBoundingClientRect();

      const topOverflow = Math.max(0, containerRect.top - originRects.row.top);
      const bottomOverflow = Math.max(0, originRects.row.bottom - containerRect.bottom);
      const containerDy = bottomOverflow - topOverflow;
      const topClip = originRects.row.top - containerRect.top - containerDy;
      const bottomClip = containerRect.bottom - originRects.row.bottom + containerDy;
      const leftClip = Math.max(0, originRects.row.left - containerRect.left);
      const rightClip = Math.max(0, containerRect.right - originRects.row.right);
      const dy = originRects.logo.top - logoTargetRect.top - containerDy;

      clipStateRef.current = { topClip, bottomClip, leftClip, rightClip, containerDy, dy };

      const isDark = document.documentElement.classList.contains("dark");
      const cardBg = isDark ? "#1F1F21" : "#EEEFF1";
      const modalBg = isDark ? "#111113" : "#FFFFFF";

      containerControls.set({
        clipPath: `inset(${topClip}px ${rightClip}px ${bottomClip}px ${leftClip}px round 12px)`,
        backgroundColor: cardBg,
        y: containerDy,
      });
      headerControls.set({ y: dy });
      imageControls.set({ opacity: 0, filter: "blur(4px)" });
      bodyControls.set({ opacity: 0, filter: "blur(4px)" });
      highlightsControls.set({ opacity: 0, filter: "blur(4px)" });

      const runAnimation = () => {
        if (cancelled) return;
        rafId = requestAnimationFrame(() => {
          containerControls.start({
            clipPath: "inset(0px 0px 0px 0px round 12px)",
            backgroundColor: modalBg,
            y: 0,
            transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
          });
          headerControls.start({
            y: 0,
            transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
          });
          closeButtonControls.start({
            opacity: 1,
            filter: "blur(0px)",
            transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
          });
          imageControls.start({
            opacity: 1,
            filter: "blur(0px)",
            transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
          });
          bodyControls.start({
            opacity: 1,
            filter: "blur(0px)",
            transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
          });
          highlightsControls.start({
            opacity: 1,
            filter: "blur(0px)",
            transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1], delay: 0.1 },
          });
        });
      };

      const logoImgEl = logoRef.current.querySelector('img') as HTMLImageElement | null;
      if (logoImgEl) {
        logoImgEl.decode().then(runAnimation).catch(runAnimation);
      } else {
        runAnimation();
      }
    }

    return () => {
      cancelled = true;
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    };
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
    onCloseStart?.();

    const transition = { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const };

    if (prefersReducedMotion) {
      await Promise.all([
        backdropControls.start({ opacity: 0, transition }),
        closeButtonControls.start({ opacity: 0, transition }),
        containerControls.start({ opacity: 0, transition }),
        imageControls.start({ opacity: 0, transition }),
        bodyControls.start({ opacity: 0, transition }),
        highlightsControls.start({ opacity: 0, transition }),
      ]);
      onClose();
      return;
    }

    if (!clipStateRef.current) {
      onClose();
      return;
    }

    const { topClip, bottomClip, leftClip, rightClip, containerDy, dy } = clipStateRef.current;

    await Promise.all([
      backdropControls.start({ opacity: 0, transition }),
      closeButtonControls.start({ opacity: 0, transition }),
      containerControls.start({
        clipPath: `inset(${topClip}px ${rightClip}px ${bottomClip}px ${leftClip}px round 12px)`,
        y: containerDy,
        transition,
      }),
      headerControls.start({ y: dy, transition }),
      imageControls.start({ opacity: 0, filter: "blur(4px)", transition }),
      bodyControls.start({ opacity: 0, filter: "blur(4px)", transition }),
      highlightsControls.start({ opacity: 0, filter: "blur(4px)", transition }),
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
          className="relative w-full max-w-[592px] rounded-xl pointer-events-auto my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={closeButtonControls}
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 rounded-full p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white active:scale-[0.97] transition-[transform,background-color] duration-150"
            aria-label="Close"
          >
            <X size={16} />
          </motion.button>

          {/* Image area — transparent during clip expansion, fades in after */}
          <motion.div
            className="w-full overflow-hidden rounded-t-xl"
            style={experience.image ? { aspectRatio: "4/3" } : { height: 200 }}
            animate={imageControls}
          >
            {experience.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={experience.image}
                alt={`${experience.company} work`}
                className="w-full h-full object-cover"
                decoding="async"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center" style={{ paddingTop: 13 }}>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, var(--color-fg) 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                    backgroundPosition: "center",
                    opacity: 0.15,
                  }}
                />
                <TextShimmer duration={2} className="text-base relative z-10">
                  Details coming soon
                </TextShimmer>
              </div>
            )}
          </motion.div>

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
                  decoding="sync"
                />
              </div>
              <div className="flex flex-col gap-0.5" style={{ width: 184 }}>
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
            {experience.description && <p
              className="px-4 pt-2 text-base sm:text-pretty"
              style={{ lineHeight: 1.4, color: "var(--color-fg-muted)" }}
            >
              {experience.description}
            </p>}

            <motion.div animate={highlightsControls}>
              {experience.highlights.length > 0 && <div className="px-4 pt-4">
                <span
                  className="font-medium text-base sm:text-balance"
                  style={{ color: "var(--color-fg)" }}
                >
                  Highlights
                </span>
                <div className="mt-1 flex flex-col gap-1">
                  {experience.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex gap-2 text-base"
                      style={{ lineHeight: 1.4, color: "var(--color-fg)", opacity: 0.7 }}
                    >
                      <span className="shrink-0">–</span>
                      <span className="sm:text-pretty">{h}</span>
                    </div>
                  ))}
                </div>
              </div>}
            </motion.div>
            <div className="pb-4" />
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

export function JobExperienceModal({ experience, originRects, onClose, onCloseStart, onExitComplete }: JobExperienceModalProps) {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {experience && (
        <ModalContent
          key={experience.company}
          experience={experience}
          originRects={originRects}
          onClose={onClose}
          onCloseStart={onCloseStart}
        />
      )}
    </AnimatePresence>
  );
}
