"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "If you are seeking a highly motivated and skilled product designer who excels in solving complex UX problems, and top notch UI, I wholeheartedly recommend Sebastião without reservation...",
    name: "João Oliveira Simões",
    role: "Founder & Design Lead",
    company: "@HOP Design",
  },
  {
    quote:
      "Sebastião is a incredibly talented product designer, and his work for Tempest was no short of amazing. Designing great products takes much more than a UI, and Seb understood that very well...",
    name: "Ionut Vidu",
    role: "Head of the Infinity Browsers BU",
    company: "@ Tempest",
  },
  {
    quote:
      "I am delighted to have the opportunity to wholeheartedly recommend Sebastião. Having had the privilege of collaborating closely with him during our time at Tempest...",
    name: "Ahmed Abd Elmageed",
    role: "Senior Technical Product Owner",
    company: "@ Sonar",
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [minHeight, setMinHeight] = useState<number | undefined>();

  useEffect(() => {
    const heights = measureRefs.current.map((el) => el?.offsetHeight ?? 0);
    const max = Math.max(...heights);
    if (max > 0) setMinHeight(max);
  }, []);

  const navigate = (dir: number) => {
    setDirection(dir);
    setActiveIndex((prev) => (prev + dir + testimonials.length) % testimonials.length);
    setAnimKey((k) => k + 1);
  };

  const goTo = (index: number) => {
    const dir = index > activeIndex ? 1 : -1;
    setDirection(dir);
    setActiveIndex(index);
    setAnimKey((k) => k + 1);
  };

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
      setAnimKey((k) => k + 1);
    }, 6000);
    return () => clearInterval(id);
  }, [isPaused]);

  const t = testimonials[activeIndex];

  const enterX = prefersReducedMotion ? 0 : direction * 16;
  const exitX = prefersReducedMotion ? 0 : direction * -16;
  const blurAmount = prefersReducedMotion ? "blur(0px)" : "blur(4px)";

  return (
    <div
      className="flex flex-col gap-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Off-screen measurement layer */}
      <div className="invisible absolute pointer-events-none w-full" aria-hidden="true">
        {testimonials.map((t, i) => (
          <div key={i} ref={(el) => { measureRefs.current[i] = el; }}>
            <div className="rounded-xl border p-4 w-full">
              <p className="text-base" style={{ lineHeight: 1.5 }}>
                <em>{t.quote}</em>
              </p>
              <div className="h-[0.75em]" />
              <p className="text-sm font-medium" style={{ lineHeight: 1.5 }}>{t.name}</p>
              <p className="text-sm" style={{ lineHeight: 1.5 }}>{t.role} {t.company}</p>
            </div>
          </div>
        ))}
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragMomentum={false}
        dragElastic={0.05}
        onDragEnd={(_, info) => {
          if (info.offset.x < -40) navigate(1);
          else if (info.offset.x > 40) navigate(-1);
        }}
        onPointerDown={() => setIsPaused(true)}
        onPointerUp={() => setIsPaused(false)}
        className="cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: "pan-y", minHeight }}
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, filter: blurAmount, x: enterX }}
            animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
            exit={{ opacity: 0, filter: blurAmount, x: exitX }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            <div
              className="rounded-xl border p-4 w-full flex flex-col"
              style={{
                background: "var(--color-bg)",
                borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)",
                minHeight,
              }}
            >
              <p
                className="text-base flex-1"
                style={
                  { lineHeight: 1.5, textWrap: "pretty", color: "var(--color-fg-muted)" } as React.CSSProperties
                }
              >
                <em>{t.quote}</em>
              </p>
              <div className="h-[0.75em]" />
              <p className="text-sm font-medium" style={{ lineHeight: 1.5, color: "var(--color-fg)" }}>
                {t.name}
              </p>
              <p className="text-sm" style={{ lineHeight: 1.5, color: "var(--color-fg-muted)" }}>
                {t.role} {t.company}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Progress nav dots */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center transition-opacity duration-150"
          style={{ minHeight: 24, minWidth: 24, opacity: 0.4, color: "var(--color-fg)" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.4")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center gap-[6px]">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className="flex items-center justify-center"
              style={{ minHeight: 24, minWidth: i === activeIndex ? 28 : 14 }}
            >
              <div
                className={cn(
                  "h-[6px] rounded-full overflow-hidden transition-all duration-300",
                  i === activeIndex ? "w-7" : "w-[6px] opacity-40"
                )}
                style={{ background: "var(--color-border)" }}
              >
                {i === activeIndex && (
                  <div
                    key={animKey}
                    className="h-full rounded-full"
                    style={{
                      background: "var(--color-fg)",
                      animationName: "testimonial-progress",
                      animationDuration: "6s",
                      animationTimingFunction: "linear",
                      animationFillMode: "forwards",
                      animationPlayState: isPaused ? "paused" : "running",
                    }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => navigate(1)}
          className="flex items-center justify-center transition-opacity duration-150"
          style={{ minHeight: 24, minWidth: 24, opacity: 0.4, color: "var(--color-fg)" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.4")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 2.5L10 7l-4.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
