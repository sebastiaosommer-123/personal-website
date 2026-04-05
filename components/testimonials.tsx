"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { motion, useMotionValue, animate, useReducedMotion } from "motion/react";

const GAP = 16;

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
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const x = useMotionValue(0);

  const isDragging = useRef(false);
  const pointerStartX = useRef(0);
  const motionStartX = useRef(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setCardWidth(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const getTargetX = (index: number) => -(index * (cardWidth + GAP));

  // Sync x when cardWidth changes (e.g. window resize)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (cardWidth > 0) x.set(getTargetX(activeIndex));
  }, [cardWidth]);

  const snapTo = (index: number) => {
    const target = getTargetX(index);
    if (prefersReducedMotion) {
      x.set(target);
    } else {
      animate(x, target, { type: "spring", bounce: 0, duration: 0.4 });
    }
    setActiveIndex(index);
  };

  const navigate = (dir: number) => {
    const next = (activeIndex + dir + testimonials.length) % testimonials.length;
    snapTo(next);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    pointerStartX.current = e.clientX;
    motionStartX.current = x.get();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - pointerStartX.current;
    const rawX = motionStartX.current + delta;
    const minX = getTargetX(testimonials.length - 1);
    const maxX = 0;
    x.set(Math.max(minX, Math.min(maxX, rawX)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const delta = e.clientX - pointerStartX.current;
    const threshold = cardWidth * 0.2;

    if (delta < -threshold && activeIndex < testimonials.length - 1) {
      snapTo(activeIndex + 1);
    } else if (delta > threshold && activeIndex > 0) {
      snapTo(activeIndex - 1);
    } else {
      animate(x, getTargetX(activeIndex), { type: "spring", bounce: 0.1, duration: 0.35 });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div ref={containerRef} className="overflow-hidden w-full">
        <motion.div
          className="flex cursor-grab active:cursor-grabbing select-none"
          style={{ x, gap: GAP, touchAction: "pan-y", willChange: "transform" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-xl border p-4 flex flex-col"
              style={{
                width: cardWidth || "100%",
                background: "var(--color-bg)",
                borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)",
              }}
            >
              <p
                className="text-base flex-1"
                style={{ lineHeight: 1.5, color: "var(--color-fg-muted)" }}
              >
                <em>{t.quote}</em>
              </p>
              <div className="h-[0.75em]" />
              <p
                className="text-sm font-medium"
                style={{ lineHeight: 1.5, color: "var(--color-fg)" }}
              >
                {t.name}
              </p>
              <p className="text-sm" style={{ lineHeight: 1.5, color: "var(--color-fg-muted)" }}>
                {t.role} {t.company}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Progress nav */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center transition-opacity duration-150"
          style={{ minHeight: 24, minWidth: 24, opacity: 0.4, color: "var(--color-fg)" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => snapTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className="flex items-center justify-center"
              style={{ minHeight: 24, minWidth: 6 }}
            >
              <div
                className="h-[6px] w-[6px] rounded-full transition-opacity duration-300"
                style={{
                  background: i === activeIndex ? "var(--color-fg)" : "var(--color-border)",
                  opacity: i === activeIndex ? 0.6 : 0.4,
                }}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => navigate(1)}
          className="flex items-center justify-center transition-opacity duration-150"
          style={{ minHeight: 24, minWidth: 24, opacity: 0.4, color: "var(--color-fg)" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 2.5L10 7l-4.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
