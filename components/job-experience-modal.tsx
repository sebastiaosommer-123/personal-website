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
