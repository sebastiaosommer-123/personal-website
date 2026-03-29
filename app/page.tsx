"use client";

import { motion } from "motion/react";

const block = (delay: number) => ({
  initial: { opacity: 0, filter: "blur(8px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1], delay },
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
  return (
    <main className="min-h-screen bg-white flex items-start justify-center px-6 py-24">
      <div className="w-full max-w-[469px] flex flex-col gap-4">

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

        <div className="flex flex-col gap-6">

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
          </motion.div>

          {/* Skills */}
          <motion.div {...block(0.24)} className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-[#EEEFF1] text-[#18191C] text-base px-2 flex items-center"
                style={{ borderRadius: 12, height: 38, lineHeight: "1.4375" }}
              >
                {skill}
              </span>
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
                  <div className="mt-4 h-px bg-[#EEEFF1] w-full" />
                )}
              </div>
            ))}
          </motion.div>

          {/* Personal note */}
          <motion.p
            {...block(0.40)}
            className="text-base text-[#18191C]"
            style={{ lineHeight: 1.5 }}
          >
            On my free time I surf, play with shaders and build tools.
          </motion.p>

          {/* Social links */}
          <motion.div {...block(0.48)} className="flex justify-between gap-6">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="text-base text-[#18191C]"
                style={{
                  lineHeight: 1.5,
                  opacity: 0.5,
                  transition: "opacity 150ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.5"; }}
              >
                {s.label}
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
