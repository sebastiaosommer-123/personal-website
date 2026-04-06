"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

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

const variants = {
  initial: (dir: number) => ({
    x: dir * 16,
    filter: "blur(8px)",
    opacity: 0,
  }),
  animate: {
    x: 0,
    filter: "blur(0px)",
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir * -16,
    filter: "blur(8px)",
    opacity: 0,
  }),
};

const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const direction = useRef(1);
  const pointerStartX = useRef(0);

  const navigate = (dir: number) => {
    direction.current = dir;
    setActiveIndex((i) => (i + dir + testimonials.length) % testimonials.length);
  };

  const goTo = (i: number) => {
    direction.current = i > activeIndex ? 1 : -1;
    setActiveIndex(i);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const delta = e.clientX - pointerStartX.current;
    if (delta < -50) navigate(1);
    else if (delta > 50) navigate(-1);
  };

  const t = testimonials[activeIndex];
  const activeVariants = prefersReducedMotion ? reducedMotionVariants : variants;

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="wait" custom={direction.current}>
        <motion.div
          key={activeIndex}
          custom={direction.current}
          variants={activeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.4,
            ease: [0.23, 1, 0.32, 1],
            exit: { duration: 0.25 },
          }}
          className="flex flex-col items-center text-center select-none cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <p
            className="text-base"
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
        </motion.div>
      </AnimatePresence>

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
              onClick={() => goTo(i)}
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
