"use client";

import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import { useState, useEffect, useRef } from "react";
import Float from "@/components/fancy/blocks/float";
import { Tilt } from "@/components/motion-primitives/tilt";
import { AnimatedBackground } from "@/components/motion-primitives/animated-background";
import { DirectionalUnderline } from "@/components/ui/directional-underline";
import { Toggle } from "@/components/ui/toggle";
import { Power, Plus } from "lucide-react";
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerPlayButton,
  VideoPlayerTimeRange,
  VideoPlayerMuteButton,
} from "@/components/ui/skiper-ui/skiper67";
import { SurfDevice } from "@/components/surf-device";
import { Testimonials } from "@/components/testimonials";

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
    role: "Sr. Product Designer",
    period: "2025 – Current",
    logo: "/assets/stealth-startup.svg",
  },
  {
    company: "HOP Design",
    role: "Sr. Product Designer",
    period: "2023 – 25'",
    logo: "/assets/hop-design.svg",
  },
  {
    company: "Tempest",
    role: "Sr. Product Designer",
    period: "2022 – 23'",
    logo: "/assets/tempest.svg",
  },
  {
    company: "HOP Studio",
    role: "UX/UI Designer",
    period: "2020 – 22'",
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
  const [surfOpen, setSurfOpen] = useState(false);
  const [surfPeeking, setSurfPeeking] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cardRef = useRef<HTMLDivElement>(null);
  const [videoModal, setVideoModal] = useState<{ src: string; scale: number; offsetX: number; offsetY: number } | null>(null);
  const [activeProject, setActiveProject] = useState<'shaders' | 'tools' | null>(null);
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);

  const SHADERS_VIDEO_SRC = "https://res.cloudinary.com/dcewfztrv/video/upload/q_auto,f_auto,vc_auto/v1775322457/1_l2hxt0.mov";
  const TOOLS_VIDEO_SRC = "https://res.cloudinary.com/dcewfztrv/video/upload/q_auto,f_auto,vc_auto/v1775322120/2_axbpw4.mov";

  const CARD_W = 256;
  const CARD_H = 144;

  const handleProjectEnter = (project: 'shaders' | 'tools', e: React.MouseEvent) => {
    clearTimeout(hideTimer.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const newX = rect.left + rect.width / 2 - CARD_W / 2;
    const newY = rect.top - CARD_H - 12;
    if (activeProject === null) {
      // Snap directly — no animation on fresh appear
      cardX.set(newX);
      cardY.set(newY);
    } else {
      // Spring between positions when card is already visible
      animate(cardX, newX, { type: 'spring', stiffness: 400, damping: 35 });
      animate(cardY, newY, { type: 'spring', stiffness: 400, damping: 35 });
    }
    setActiveProject(project);
  };

  const startHideTimer = () => {
    hideTimer.current = setTimeout(() => setActiveProject(null), 300);
  };
  const [deviceScale, setDeviceScale] = useState(1);
  const [isTouch, setIsTouch] = useState(false);

  const DEVICE_W = 420;
  const DEVICE_H = 440;

  useEffect(() => {
    const update = () => {
      setDeviceScale(Math.min(1, (window.innerWidth - 32) / DEVICE_W));
      setIsTouch(window.matchMedia('(hover: none)').matches);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (videoModal) setVideoModal(null);
        else if (surfOpen) setSurfOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [surfOpen, videoModal]);
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
    <main className="min-h-screen flex items-start justify-center px-6 pt-10 md:pt-[60px] lg:pt-[80px] pb-5 md:pb-[30px] lg:pb-[40px] relative overflow-visible" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* <div className="fixed inset-0 pointer-events-none z-20">
        {floatingSkills.map(({ skill, top, left, amplitude, rotationRange, speed }) => (
          <motion.div key={skill} className="absolute" style={{ top, left }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease: "easeOut" }}>
            <Float amplitude={amplitude} rotationRange={rotationRange} speed={speed}>
              <Tilt rotationFactor={30} springOptions={{ stiffness: 200, damping: 20 }}>
                <span
                  className="text-base px-2 flex items-center select-none whitespace-nowrap"
                  style={{
                    borderRadius: 12,
                    height: 38,
                    lineHeight: "1.4375",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-fg)",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.07), 0 12px 28px rgba(0,0,0,0.05)",
                  }}
                >
                  {skill}
                </span>
              </Tilt>
            </Float>
          </motion.div>
        ))}
      </div> */}

      <div className="relative w-full max-w-[469px] flex flex-col gap-4">

        {/* Name + Title */}
        <div className="flex flex-col gap-0.5 w-[210px]">
          <motion.h1
            {...block(0)}
            className="font-medium text-base"
            style={{ lineHeight: 1.3, color: "var(--color-fg)" }}
          >
            Sebastião Sommer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 0.54, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
            className="text-sm"
            style={{ lineHeight: 1.3, color: "var(--color-fg)" }}
          >
            Founding Product Designer
          </motion.p>
        </div>

        <div className="flex flex-col gap-6">

          {/* Bio */}
          <motion.div 
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.16 }}
          >
            <p className="text-base" style={{ lineHeight: 1.5, textWrap: "pretty", color: "var(--color-fg-muted)" } as React.CSSProperties}>
              Working as Founding Product Designer at a stealth AI startup,
              collaborating closely with cross functional teams to design.
              Previously shipped features across multiple apps in production.
            </p>
            <div className="h-[0.75em]" />
            <div className="text-base" style={{ lineHeight: 1.5, color: "var(--color-fg-muted)" }}>
              In my free time, I build{" "}
              <DirectionalUnderline as="a" href="https://shader-playground.sebastiaosommer.com/" target="_blank" className="font-medium inline-flex items-center whitespace-nowrap text-base" style={{ color: 'var(--color-fg)' }} onMouseEnter={(e) => handleProjectEnter('shaders', e)} onMouseLeave={startHideTimer}>Shader Playground<svg className="ml-[0.3em] mr-[0.15em] size-[0.55em]" fill="none" viewBox="-1 -1 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></DirectionalUnderline>,{" "}
              <DirectionalUnderline as="a" href="https://ui-sound-lab.sebastiaosommer.com/" target="_blank" className="font-medium inline-flex items-center whitespace-nowrap text-base" style={{ color: 'var(--color-fg)' }} onMouseEnter={(e) => handleProjectEnter('tools', e)} onMouseLeave={startHideTimer}>UI Sound Lab<svg className="ml-[0.3em] mr-[0.15em] size-[0.55em]" fill="none" viewBox="-1 -1 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></DirectionalUnderline>,{" "}<span className="whitespace-nowrap">and{" "}
              <Toggle
                pressed={surfOpen}
                onPressedChange={setSurfOpen}
                variant="outline"
                className="rounded-[8px] h-auto min-w-0 py-0.5 px-1.5 mr-0.5 gap-1 font-medium whitespace-nowrap
                           border-[var(--color-border)]
                           hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)]
                           data-[state=on]:bg-[var(--color-surface)] data-[state=on]:text-[var(--color-fg)] data-[state=on]:border-[var(--color-border)]
                           active:scale-[0.97] focus-visible:ring-0 focus-visible:ring-offset-0
                           transition-[transform,border-color,background-color] duration-150 cursor-pointer"
                style={{ color: 'var(--color-fg)', verticalAlign: 'middle', fontSize: 'inherit', lineHeight: 1.2, marginBottom: '2px' }}
                onMouseEnter={() => { if (!isTouch) setSurfPeeking(true); }}
                onMouseLeave={() => { if (!isTouch) setSurfPeeking(false); }}
              >
                surf
              </Toggle>.</span>
            </div>
          </motion.div>

          {/* Skills */}
          {/* <motion.div {...block(0.24)} layout className="flex flex-wrap gap-2">
            {visibleSkills.map((skill) => (
              <motion.span
                key={skill}
                layout
                onClick={(e) => handleSkillClick(skill, e)}
                className="text-base px-2 flex items-center cursor-pointer select-none"
                style={{
                  borderRadius: 12,
                  height: 38,
                  lineHeight: "1.4375",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-fg)",
                }}
              >
                {skill}
              </motion.span>
            ))}
          </motion.div> */}

          {/* Experience */}
          <motion.div {...block(0.32)} className="flex flex-col -mx-3">
            <AnimatedBackground
              enableHover={!isTouch}
              className="rounded-xl bg-black/[0.04] dark:bg-white/[0.06]"
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
              {experience.map((exp) => (
                <div
                  key={exp.company}
                  data-id={exp.company}
                  className="w-full cursor-pointer"
                >
                  <div className="flex w-full items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="shrink-0 overflow-hidden flex items-center justify-center"
                        style={{ width: 38, height: 38, borderRadius: 10.36, backgroundColor: "var(--color-surface)" }}
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
                        <span className="font-medium text-base" style={{ lineHeight: 1.3, color: "var(--color-fg)" }}>
                          {exp.role}
                        </span>
                        <span className="text-sm" style={{ lineHeight: 1.3, color: "var(--color-fg)", opacity: 0.7 }}>
                          {exp.company}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-sm text-right"
                      style={{ lineHeight: 1.643, fontVariantNumeric: "tabular-nums", color: "var(--color-fg)" }}
                    >
                      {exp.period}
                    </span>
                  </div>
                </div>
              ))}
            </AnimatedBackground>
          </motion.div>

          {/* Testimonials */}
          <motion.div {...block(0.40)}>
            <Testimonials />
          </motion.div>

          {/* Social links */}
          <motion.div {...block(0.48)} className="flex justify-between gap-6 mt-2">
            {socials.map((s) => (
              <DirectionalUnderline
                as="a"
                key={s.label}
                href={s.href}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                className="group flex items-center text-base font-medium"
                style={{ lineHeight: 1.5, color: "var(--color-fg)" }}
              >
                {s.label}
                <svg
                  className="ml-[0.3em] size-[0.55em]"
                  fill="none"
                  viewBox="-1 -1 12 12"
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
              </DirectionalUnderline>
            ))}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {surfPeeking && !surfOpen && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none z-40"
            initial={{ y: DEVICE_H * deviceScale }}
            animate={{ y: (DEVICE_H - 80) * deviceScale }}
            exit={{ y: DEVICE_H * deviceScale }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'bottom center', transform: `scale(${deviceScale})` }}
          >
            <SurfDevice onClose={() => setSurfOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {surfOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setSurfOpen(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              initial={{ y: "100vh", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <div
                className="pointer-events-auto"
                style={{ transform: `scale(${deviceScale})`, transformOrigin: 'center center' }}
                onClick={(e) => e.stopPropagation()}
              >
                <SurfDevice onClose={() => setSurfOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Shared video preview card */}
      <motion.div
        className="fixed z-[9999]"
        style={{ left: 0, top: 0, pointerEvents: activeProject ? 'auto' : 'none', x: cardX, y: cardY }}
      >
        <motion.div
          ref={cardRef}
          className="w-64 rounded-lg shadow-md overflow-hidden cursor-pointer"
          animate={{
            y: activeProject ? 0 : 16,
            opacity: activeProject ? 1 : 0,
            scale: activeProject ? 1 : 0.98,
            filter: activeProject ? 'blur(0px)' : 'blur(4px)',
          }}
          initial={{ y: 16, opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          transition={
            activeProject
              ? { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
              : { duration: 0.15, ease: [0.23, 1, 0.32, 1] }
          }
          onMouseEnter={() => clearTimeout(hideTimer.current)}
          onMouseLeave={startHideTimer}
          onClick={() => {
            const rect = cardRef.current?.getBoundingClientRect();
            const src = activeProject === 'shaders' ? SHADERS_VIDEO_SRC : TOOLS_VIDEO_SRC;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const modalWidth = Math.min(720, vw * 0.9);
            const scale = rect ? rect.width / modalWidth : 0.97;
            const offsetX = rect ? (rect.left + rect.width / 2) - vw / 2 : 0;
            const offsetY = rect ? (rect.top + rect.height / 2) - vh / 2 : 0;
            clearTimeout(hideTimer.current);
            setActiveProject(null);
            setVideoModal({ src, scale, offsetX, offsetY });
          }}
        >
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <motion.video
              autoPlay muted loop playsInline
              className="absolute inset-0 w-full h-full object-cover block"
              src={SHADERS_VIDEO_SRC}
              animate={{ opacity: activeProject === 'shaders' ? 1 : 0 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            />
            <motion.video
              autoPlay muted loop playsInline
              className="absolute inset-0 w-full h-full object-cover block"
              src={TOOLS_VIDEO_SRC}
              animate={{ opacity: activeProject === 'tools' ? 1 : 0 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            />
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {videoModal && (
          <div className="fixed left-0 top-0 z-[10000] flex h-screen w-screen items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-0 h-full w-full bg-black/60 backdrop-blur-sm"
              onClick={() => setVideoModal(null)}
            />
            <motion.div
              initial={{ scale: videoModal.scale, x: videoModal.offsetX, y: videoModal.offsetY, borderRadius: "8px" }}
              animate={{ scale: 1, x: 0, y: 0, borderRadius: "0px" }}
              exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
              transition={{
                scale:        { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                x:            { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                y:            { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                borderRadius: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                opacity:      { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
                filter:       { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
              }}
              className="relative aspect-video w-[min(720px,90vw)] overflow-hidden"
            >
              <VideoPlayer style={{ width: "100%", height: "100%" }}>
                <VideoPlayerContent
                  src={videoModal.src}
                  autoPlay
                  slot="media"
                  className="w-full object-cover"
                  style={{ width: "100%", height: "100%" }}
                />
                <span
                  onClick={() => setVideoModal(null)}
                  className="absolute right-2 top-2 z-10 cursor-pointer rounded-full p-1 transition-colors"
                >
                  <Plus className="size-5 rotate-45 text-white" />
                </span>
                <VideoPlayerControlBar className="absolute bottom-0 left-1/2 flex w-full max-w-7xl -translate-x-1/2 items-center justify-center px-5 mix-blend-exclusion md:px-10 md:py-5">
                  <VideoPlayerPlayButton className="h-4 bg-transparent" />
                  <VideoPlayerTimeRange className="bg-transparent" />
                  <VideoPlayerMuteButton className="size-4 bg-transparent" />
                </VideoPlayerControlBar>
              </VideoPlayer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
