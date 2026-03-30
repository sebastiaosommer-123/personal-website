"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Float from "@/components/fancy/blocks/float";
import ElasticLine from "@/components/fancy/physics/elastic-line";
import { cn } from "@/lib/utils";

const block = (delay: number) => ({
  initial: { opacity: 0, filter: "blur(8px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as [number, number, number, number], delay },
});

const skills = [
  "Product Design",
  "UX/UI Design",
  "Interaction Design",
  "Web Design",
  "Prototyping",
  "User Research",
];

const experience = [
  {
    company: "Stealth AI Startup",
    role: "Senior Product Designer",
    period: "2025 – Current",
    logo: "/assets/stealth-startup.svg",
  },
  {
    company: "HOP Design",
    role: "Senior Product Designer",
    period: "2023 – 2025",
    logo: "/assets/hop-design.svg",
  },
  {
    company: "Tempest",
    role: "Senior Product Designer",
    period: "2022 – 2023",
    logo: "/assets/tempest.svg",
  },
  {
    company: "HOP Studio",
    role: "UX/UI Designer",
    period: "2020 – 2022",
    logo: "/assets/44-studio.svg",
  },
];

const socials = [
  { label: "X/Twitter", href: "https://x.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
  { label: "Email", href: "mailto:hello@example.com" },
];

export default function Home() {
  const [visibleSkills, setVisibleSkills] = useState(skills);
  const [floatingSkills, setFloatingSkills] = useState<{
    skill: string;
    top: string;
    left: string;
    amplitude: [number, number, number];
    rotationRange: [number, number, number];
    speed: number;
  }[]>([]);

  const handleSkillClick = (skill: string, e: React.MouseEvent) => {
    const tagRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const top = `${(tagRect.top / window.innerHeight) * 100}%`;
    const left = `${(tagRect.left / window.innerWidth) * 100}%`;
    setFloatingSkills((prev) => [
      ...prev,
      {
        skill,
        top,
        left,
        amplitude: [60 + Math.random() * 80, 80 + Math.random() * 120, 20 + Math.random() * 30],
        rotationRange: [5 + Math.random() * 8, 5 + Math.random() * 8, 3 + Math.random() * 4],
        speed: 0.08 + Math.random() * 0.08,
      },
    ]);
    setVisibleSkills((prev) => prev.filter((s) => s !== skill));
  };

  return (
    <main className="h-screen bg-white flex items-start justify-center px-6 py-24 relative overflow-visible">
      <div className="fixed inset-0 pointer-events-none z-20">
        {floatingSkills.map(({ skill, top, left, amplitude, rotationRange, speed }) => (
          <motion.div key={skill} className="absolute" style={{ top, left }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease: "easeOut" }}>
            <Float amplitude={amplitude} rotationRange={rotationRange} speed={speed}>
              <span
                className="bg-white text-[#18191C] text-base px-2 flex items-center select-none whitespace-nowrap"
                style={{
                  borderRadius: 12,
                  height: 38,
                  lineHeight: "1.4375",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.07), 0 12px 28px rgba(0,0,0,0.05)",
                }}
              >
                {skill}
              </span>
            </Float>
          </motion.div>
        ))}
      </div>

      <div className="relative w-full max-w-[469px] flex flex-col gap-4">

        {/* Name + Title */}
        <div className="flex flex-col gap-0.5 w-[210px]">
          <motion.h1
            {...block(0)}
            className="font-medium text-base text-[#18191C]"
            style={{ lineHeight: 1.3 }}
          >
            Sebastião Sommer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 0.54, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
            className="text-sm text-[#18191C]"
            style={{ lineHeight: 1.3 }}
          >
            Founding Product Designer
          </motion.p>
        </div>

        <div className="flex flex-col gap-8">

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 0.8, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.16 }}
          >
            <p className="text-base text-[#18191C]" style={{ lineHeight: 1.5, textWrap: "pretty" } as React.CSSProperties}>
              Working as Founding Product Designer at a stealth AI startup,
              collaborating closely with cross functional teams to design.
              Previously shipped features across multiple apps in production.
            </p>
            <div className="h-[0.75em]" />
            <p className="text-base text-[#18191C]" style={{ lineHeight: 1.5 }}>
              Selected work and detailed case studies available upon request
            </p>
            <div className="h-[0.75em]" />
            <p className="text-base text-[#18191C]" style={{ lineHeight: 1.5 }}>
              On my free time I surf, play with shaders and build tools.
            </p>
          </motion.div>

          {/* Skills */}
          <motion.div {...block(0.24)} layout className="flex flex-wrap gap-2">
            {visibleSkills.map((skill) => (
              <motion.span
                key={skill}
                layout
                onClick={(e) => handleSkillClick(skill, e)}
                className="bg-[#EEEFF1] text-[#18191C] text-base px-2 flex items-center cursor-pointer select-none"
                style={{ borderRadius: 12, height: 38, lineHeight: "1.4375" }}
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>

          {/* Experience */}
          <motion.div {...block(0.32)} className="flex flex-col gap-4">
            {experience.map((exp, i) => (
              <div key={exp.company}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="bg-[#EEEFF1] shrink-0 overflow-hidden flex items-center justify-center"
                      style={{ width: 38, height: 38, borderRadius: 10.36 }}
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
                      <span className="font-medium text-base text-[#18191C]" style={{ lineHeight: 1.3 }}>
                        {exp.role}
                      </span>
                      <span className="text-sm text-[#18191C]" style={{ lineHeight: 1.3, opacity: 0.7 }}>
                        {exp.company}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-sm text-[#18191C] text-right"
                    style={{ lineHeight: 1.643, fontVariantNumeric: "tabular-nums" }}
                  >
                    {exp.period}
                  </span>
                </div>
                {i < experience.length - 1 && (
                  <div className="mt-4 w-full" style={{ height: 20 }}>
                    <ElasticLine
                      grabThreshold={20}
                      releaseThreshold={12}
                      strokeWidth={1}
                      className="text-[#EEEFF1]"
                      transition={{ type: "spring", stiffness: 800, damping: 40 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          {/* Social links */}
          <motion.div {...block(0.40)} className="flex justify-between gap-6">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                className={cn(
                  "group relative flex items-center text-base font-medium text-[#18191C]",
                  "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-['']",
                  "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "hover:before:origin-left hover:before:scale-x-100",
                )}
                style={{ lineHeight: 1.5 }}
              >
                {s.label}
                <svg
                  className="ml-[0.3em] size-[0.55em] translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  fill="none"
                  viewBox="0 0 10 10"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
