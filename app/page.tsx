"use client";

import { motion, AnimatePresence, useMotionValue, animate, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Tilt } from "@/components/motion-primitives/tilt";
import { AnimatedBackground } from "@/components/motion-primitives/animated-background";
import { DirectionalUnderline } from "@/components/ui/directional-underline";
import { Toggle } from "@/components/ui/toggle";
import { Play, Power, X } from "lucide-react";
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerPlayButton,
  VideoPlayerTimeRange,
  VideoPlayerMuteButton,
} from "@/components/ui/skiper-ui/skiper67";
import SurfDevice, { SurfDeviceHandle } from "@/components/surf-device";
import { Testimonials } from "@/components/testimonials";
import { JobExperienceModal, type ExperienceItem, type OriginRects } from "@/components/job-experience-modal";

const block = (delay: number, rm: boolean | null | undefined = false) => ({
  initial: rm ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)" },
  animate: rm ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" },
  transition: { duration: rm ? 0.2 : 0.4, ease: [0.23, 1, 0.32, 1] as [number, number, number, number], delay },
});

const experience: ExperienceItem[] = [
  {
    company: "Stealth AI Startup",
    role: "Sr. Product Designer",
    period: "2025 – Current",
    logo: "/assets/stealth-startup.svg",
    description: "",
    highlights: [],
  },
  {
    company: "HOP Design",
    role: "Sr. Product Designer",
    period: "2023 – 25'",
    logo: "/assets/hop-design.svg",
    image: "/assets/sr-product-designer-hop-design.webp",
    description: (
      <>
        Led end to end design across mobile and web for multiple clients. Mentored two designers and contributed to product direction. Selected work includes{" "}
        <DirectionalUnderline as="a" href="https://apps.apple.com/us/app/allstays-camp-rv-camping/id370820516" target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-medium whitespace-nowrap" style={{ color: "var(--color-fg)" }}>AllStays<svg className="ml-[0.3em] size-[0.55em]" fill="none" viewBox="-1 -1 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></DirectionalUnderline>,{" "}
        <DirectionalUnderline as="a" href="https://apps.apple.com/us/app/fitness-ai-gym-workout-planner/id1446224156" target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-medium whitespace-nowrap" style={{ color: "var(--color-fg)" }}>Fitness AI<svg className="ml-[0.3em] size-[0.55em]" fill="none" viewBox="-1 -1 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></DirectionalUnderline>,{" "}
        <DirectionalUnderline as="a" href="https://www.padme.ai/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-medium whitespace-nowrap" style={{ color: "var(--color-fg)" }}>Padmé<svg className="ml-[0.3em] size-[0.55em]" fill="none" viewBox="-1 -1 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></DirectionalUnderline>, and{" "}
        <DirectionalUnderline as="a" href="https://infinity-browsers.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-medium whitespace-nowrap" style={{ color: "var(--color-fg)" }}>Infinity Browsers<svg className="ml-[0.3em] size-[0.55em]" fill="none" viewBox="-1 -1 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></DirectionalUnderline>.
      </>
    ),
    highlights: [],
  },
  {
    company: "Tempest",
    role: "Sr. Product Designer",
    period: "2022 – 23'",
    logo: "/assets/tempest.svg",
    image: "/assets/sr-product-designer-tempest.webp",
    description:
      "Designed and shipped a privacy focused search engine and browser across iOS and desktop. Worked end to end from concept to launch. Led the design system across the product portfolio.",
    highlights: [],
  },
  {
    company: "44 Studio",
    role: "UX/UI Designer",
    period: "2020 – 22'",
    logo: "/assets/44-studio.svg",
    image: "/assets/ux-ui-designer-44-studio.webp",
    description:
      "Shipped multiple products across mobile and web, including 7 iOS apps and 4 dashboards. Operated across the full design process in fast moving startup environments. Team later acquired by Tempest.",
    highlights: [],
  },
];

const socials = [
  { label: "X/Twitter", href: "https://x.com/SebastiaoSommer" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sebastiao-sommer/" },
  { label: "GitHub", href: "https://github.com/sebastiaosommer-123" },
  { label: "Email", href: "mailto:sebastiaosommer@gmail.com" },
];

export default function Home() {
  const [surfOpen, setSurfOpen] = useState(false);
  const [surfPeeking, setSurfPeeking] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const showRaf   = useRef<number | undefined>(undefined);
  const cardRef = useRef<HTMLDivElement>(null);
  const surfDeviceRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const shadersVideoRef = useRef<HTMLVideoElement>(null);
  const toolsVideoRef   = useRef<HTMLVideoElement>(null);
  const surfHandleRef = useRef<SurfDeviceHandle>(null);
  const surfPausedByModal = useRef(false);
  const [videoModal, setVideoModal] = useState<{ src: string; scale: number; offsetX: number; offsetY: number; frameDataUrl: string | null } | null>(null);
  const [activeProject, setActiveProject] = useState<'shaders' | 'tools' | null>(null);
  const [cardSnappedHidden, setCardSnappedHidden] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceItem | null>(null);
  const [modalClosing, setModalClosing] = useState(false);
  const originRectsRef = useRef<OriginRects | null>(null);
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const cardSpringsRef = useRef<{ x: AnimationPlaybackControls | null; y: AnimationPlaybackControls | null }>({ x: null, y: null });
  const prefersReducedMotion = useReducedMotion();

  const SHADERS_VIDEO_SRC = "https://res.cloudinary.com/dcewfztrv/video/upload/q_auto,f_auto,vc_auto/v1776636361/shader-playground-walkthrough_a9sotg.mp4";
  const TOOLS_VIDEO_SRC = "https://res.cloudinary.com/dcewfztrv/video/upload/q_auto,f_auto,vc_auto/v1775757301/ui-sound-lab-walkthrough_nrszl7.mp4";

  const CARD_W = 256;
  const CARD_H = 144;

  const handleProjectEnter = (project: 'shaders' | 'tools', e: React.MouseEvent) => {
    clearTimeout(hideTimer.current);
    cancelAnimationFrame(showRaf.current!);
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const newX = rect.left + rect.width / 2 - CARD_W / 2;
    const newY = rect.top - CARD_H - 12;
    if (activeProject === null) {
      // Stop any lingering spring animations so .set() has uncontested ownership.
      cardSpringsRef.current.x?.stop();
      cardSpringsRef.current.y?.stop();
      cardSpringsRef.current = { x: null, y: null };
      // Pre-position using current rect so the card is never at (0,0).
      cardX.set(newX);
      cardY.set(newY);
      // Re-measure inside RAF: by this point any font-load layout shift that
      // happened since mouseenter has already settled, giving the correct position.
      showRaf.current = requestAnimationFrame(() => {
        const freshRect = el.getBoundingClientRect();
        cardX.set(freshRect.left + freshRect.width / 2 - CARD_W / 2);
        cardY.set(freshRect.top - CARD_H - 12);
        setActiveProject(project);
      });
    } else {
      // Spring between positions when card is already visible
      if (prefersReducedMotion) {
        cardX.set(newX);
        cardY.set(newY);
      } else {
        cardSpringsRef.current.x = animate(cardX, newX, { type: 'spring', stiffness: 400, damping: 35 });
        cardSpringsRef.current.y = animate(cardY, newY, { type: 'spring', stiffness: 400, damping: 35 });
      }
      setActiveProject(project);
    }
  };

  const startHideTimer = () => {
    cancelAnimationFrame(showRaf.current!);
    cardSpringsRef.current.x?.stop();
    cardSpringsRef.current.y?.stop();
    cardSpringsRef.current = { x: null, y: null };
    hideTimer.current = setTimeout(() => setActiveProject(null), 200);
  };

  const closeModal = () => {
    setModalClosing(true);
    setCardSnappedHidden(false);
    setVideoModal(null);
  };

  const closeSurf = () => {
    setSurfOpen(false);
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
        if (videoModal) closeModal();
        else if (surfOpen) closeSurf();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [surfOpen, videoModal]);

  useEffect(() => {
    const modalOpen = !!(videoModal || selectedExperience);
    if (modalOpen) {
      if (surfHandleRef.current?.isPlaying()) {
        surfHandleRef.current.pause();
        surfPausedByModal.current = true;
      }
    } else {
      if (surfPausedByModal.current) {
        surfHandleRef.current?.resume();
        surfPausedByModal.current = false;
      }
    }
  }, [videoModal, selectedExperience]);

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      // bfcache restore: Framer Motion's RAF loop restarts and can replay stale
      // animation state from the previous session. Reset everything so the next
      // hover starts clean.
      cancelAnimationFrame(showRaf.current!);
      clearTimeout(hideTimer.current);
      cardSpringsRef.current.x?.stop();
      cardSpringsRef.current.y?.stop();
      cardSpringsRef.current = { x: null, y: null };
      cardX.set(0);
      cardY.set(0);
      setActiveProject(null);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [cardX, cardY]);

  useEffect(() => {
    const images = experience.flatMap((exp) => exp.image ? [exp.image] : []);
    images.forEach((src) => { new Image().src = src; });
  }, []);

  return (
    <main className="min-h-screen flex items-start justify-center px-6 pt-10 md:pt-[60px] lg:pt-[80px] pb-10 md:pb-[60px] lg:pb-[80px] relative overflow-visible" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="relative w-full max-w-[469px] flex flex-col gap-4">

        {/* Name + Title */}
        <div className="flex flex-col gap-0.5 w-[210px]">
          <motion.h1
            {...block(0, prefersReducedMotion)}
            className="font-medium text-base"
            style={{ lineHeight: 1.3, color: "var(--color-fg)" }}
          >
            Sebastião Sommer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, ...(prefersReducedMotion ? {} : { filter: "blur(8px)" }) }}
            animate={{ opacity: 0.54, ...(prefersReducedMotion ? {} : { filter: "blur(0px)" }) }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
            className="text-sm"
            style={{ lineHeight: 1.3, color: "var(--color-fg)" }}
          >
            Founding Product Designer
          </motion.p>
        </div>

        <div className="flex flex-col gap-6">

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, ...(prefersReducedMotion ? {} : { filter: "blur(8px)" }) }}
            animate={{ opacity: 1, ...(prefersReducedMotion ? {} : { filter: "blur(0px)" }) }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.16 }}
          >
            <p className="text-base" style={{ lineHeight: 1.5, textWrap: "pretty", color: "var(--color-fg-muted)" } as React.CSSProperties}>
              Founding product designer at a stealth AI company, building consumer wellness apps from zero to one. I work close to product, shaping experiments across onboarding, activation, and retention with a focus on both user value and long term outcomes.
            </p>
            <div className="h-[0.75em]" />
            <div className="text-base" style={{ lineHeight: 1.5, color: "var(--color-fg-muted)" }}>
              In my free time, I build{" "}
              <DirectionalUnderline as="a" href="https://ui-sound-lab.sebastiaosommer.com/" target="_blank" className="font-medium inline-flex items-center whitespace-nowrap text-base" style={{ color: 'var(--color-fg)' }} onMouseEnter={(e) => { if (!isTouch) handleProjectEnter('tools', e); }} onMouseLeave={!isTouch ? startHideTimer : undefined}>UI Sound Lab<svg className="ml-[0.3em] mr-[0.15em] size-[0.55em]" fill="none" viewBox="-1 -1 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></DirectionalUnderline>,{" "}
              <DirectionalUnderline as="a" href="https://shader-playground.sebastiaosommer.com/" target="_blank" className="font-medium inline-flex items-center whitespace-nowrap text-base" style={{ color: 'var(--color-fg)' }} onMouseEnter={(e) => { if (!isTouch) handleProjectEnter('shaders', e); }} onMouseLeave={!isTouch ? startHideTimer : undefined}>Shader Playground<svg className="ml-[0.3em] mr-[0.15em] size-[0.55em]" fill="none" viewBox="-1 -1 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></DirectionalUnderline>,{" "}<span className="whitespace-nowrap">and{" "}
              <Toggle
                data-surf-toggle
                pressed={surfOpen}
                onPressedChange={(open) => (open ? setSurfOpen(true) : closeSurf())}
                variant="outline"
                className="rounded-[8px] h-auto min-w-0 py-0.5 px-1.5 mr-0.5 gap-1 font-medium whitespace-nowrap
                           border-[var(--color-border)]
                           hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)]
                           data-[state=on]:bg-[var(--color-surface)] data-[state=on]:text-[var(--color-fg)] data-[state=on]:border-[var(--color-border)]
                           data-[state=on]:hover:bg-transparent
                           active:scale-[0.97]
                           transition-[transform,border-color,background-color] duration-150 cursor-pointer"
                style={{ color: 'var(--color-fg)', verticalAlign: 'middle', fontSize: 'inherit', lineHeight: 1.2, marginBottom: '2px' }}
                onMouseEnter={() => { if (!isTouch) setSurfPeeking(true); }}
                onMouseLeave={() => { if (!isTouch) setSurfPeeking(false); }}
              >
                surf
              </Toggle>.</span>
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div {...block(0.32, prefersReducedMotion)} className="flex flex-col -mx-3">
            <AnimatedBackground
              enableHover={!isTouch}
              className="rounded-xl bg-black/[0.04] dark:bg-white/[0.06]"
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              resetKey={selectedExperience?.company}
            >
              {experience.map((exp) => (
                <div
                  key={exp.company}
                  data-id={exp.company}
                  className="w-full cursor-pointer"
                  onClick={(e) => {
                    const row = e.currentTarget as HTMLElement;
                    const rowRect = row.getBoundingClientRect();
                    const get = (key: string) =>
                      row.querySelector(`[data-morph="${key}"]`)?.getBoundingClientRect();
                    const logo = get("logo"),
                      role = get("role"),
                      company = get("company"),
                      period = get("period");
                    if (logo && role && company && period) {
                      originRectsRef.current = { row: rowRect, logo, role, company, period };
                    }
                    setSelectedExperience(exp);
                  }}
                >
                  <motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.1, ease: [0.23, 1, 0.32, 1] }} className="flex w-full items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        data-morph="logo"
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
                        <span data-morph="role" className="font-medium text-base" style={{ lineHeight: 1.3, color: "var(--color-fg)" }}>
                          {exp.role}
                        </span>
                        <span data-morph="company" className="text-sm" style={{ lineHeight: 1.3, color: "var(--color-fg)", opacity: 0.7 }}>
                          {exp.company}
                        </span>
                      </div>
                    </div>
                    <span
                      data-morph="period"
                      className="text-sm text-right"
                      style={{ lineHeight: 1.643, fontVariantNumeric: "tabular-nums", color: "var(--color-fg)" }}
                    >
                      {exp.period}
                    </span>
                  </motion.div>
                </div>
              ))}
            </AnimatedBackground>
          </motion.div>

          {/* Testimonials */}
          <motion.div {...block(0.40, prefersReducedMotion)}>
            <Testimonials />
          </motion.div>

          {/* Social links */}
          <motion.div {...block(0.48, prefersReducedMotion)} className="flex justify-between gap-6 mt-2">
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
            initial={prefersReducedMotion ? { opacity: 0 } : { y: DEVICE_H * deviceScale }}
            animate={prefersReducedMotion ? { opacity: 1 } : { y: (DEVICE_H - 80) * deviceScale }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: DEVICE_H * deviceScale }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.5, ease: [0.23, 1, 0.32, 1] }}
            style={prefersReducedMotion ? undefined : { transformOrigin: 'bottom center', transform: `scale(${deviceScale})` }}
          >
            <SurfDevice onClose={closeSurf} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} onExitComplete={() => { dragX.set(0); dragY.set(0); }}>
        {surfOpen && (
          <div
            ref={constraintsRef}
            className={`fixed inset-0 pointer-events-none ${modalClosing ? 'z-[10002]' : 'z-[60]'}`}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: "100vh", opacity: 0 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: "100vh", opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <motion.div
                ref={surfDeviceRef}
                drag={!isTouch}
                dragConstraints={constraintsRef}
                dragMomentum={false}
                dragElastic={0}
                style={{ x: dragX, y: dragY }}
                className="pointer-events-auto"
                whileHover={!isTouch ? { cursor: 'grab' } : undefined}
                whileDrag={!isTouch ? { cursor: 'grabbing' } : undefined}
              >
                <div style={{ transform: `scale(${deviceScale})`, transformOrigin: 'center center' }}>
                  <SurfDevice ref={surfHandleRef} onClose={closeSurf} />
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Shared video preview card */}
      <motion.div
        className="fixed z-[9999]"
        style={{ left: 0, top: 0, pointerEvents: activeProject ? 'auto' : 'none', x: cardX, y: cardY }}
      >
        <motion.div
          ref={cardRef}
          className="group w-64 rounded-lg shadow-md overflow-hidden cursor-pointer"
          animate={prefersReducedMotion ? {
            opacity: cardSnappedHidden ? 0 : (activeProject ? 1 : 0),
          } : {
            y: activeProject ? 0 : 20,
            opacity: cardSnappedHidden ? 0 : (activeProject ? 1 : 0),
            scale: activeProject ? 1 : 0.98,
            filter: activeProject ? 'blur(0px)' : 'blur(4px)',
          }}
          initial={prefersReducedMotion ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          whileTap={{ scale: 0.97 }}
          transition={
            cardSnappedHidden
              ? { duration: 0 }
              : prefersReducedMotion
                ? { duration: activeProject ? 0.2 : 0.12, ease: [0.23, 1, 0.32, 1] }
                : activeProject
                  ? { duration: 0.25, ease: [0.23, 1, 0.32, 1], scale: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } }
                  : { duration: 0.12, ease: [0.23, 1, 0.32, 1], scale: { duration: 0.12, ease: [0.23, 1, 0.32, 1] } }
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
            const videoEl = activeProject === 'shaders' ? shadersVideoRef.current : toolsVideoRef.current;
            let frameDataUrl: string | null = null;
            if (videoEl && videoEl.readyState >= 2) {
              try {
                const canvas = document.createElement('canvas');
                canvas.width  = videoEl.videoWidth  || videoEl.clientWidth;
                canvas.height = videoEl.videoHeight || videoEl.clientHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                  frameDataUrl = canvas.toDataURL('image/jpeg', 0.92);
                }
              } catch {
                frameDataUrl = null;
              }
            }
            setCardSnappedHidden(true);
            setActiveProject(null);
            setVideoModal({ src, scale, offsetX, offsetY, frameDataUrl });
          }}
        >
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <motion.video
              ref={shadersVideoRef}
              autoPlay muted loop playsInline crossOrigin="anonymous"
              className="absolute inset-0 w-full h-full object-cover block"
              src={SHADERS_VIDEO_SRC}
              animate={{ opacity: activeProject === 'shaders' ? 1 : 0 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            />
            <motion.video
              ref={toolsVideoRef}
              autoPlay muted loop playsInline crossOrigin="anonymous"
              className="absolute inset-0 w-full h-full object-cover block"
              src={TOOLS_VIDEO_SRC}
              animate={{ opacity: activeProject === 'tools' ? 1 : 0 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            />
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-1 bg-black/40 group-hover:bg-black/60 backdrop-blur-md rounded-[8px] pl-1.5 pr-2 py-1.5 transition-colors duration-150 overflow-hidden">
                <Play className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-sm font-medium leading-none">Play</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence onExitComplete={() => setModalClosing(false)}>
        {videoModal && (
          <>
            <motion.div
              key="video-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 top-0 z-[9999] h-full w-full bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <div className="fixed left-0 top-0 z-[10000] flex h-screen w-screen items-center justify-center pointer-events-none">
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { scale: videoModal.scale, x: videoModal.offsetX, y: videoModal.offsetY, borderRadius: "8px" }}
              animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, x: 0, y: 0, borderRadius: "0px" }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, filter: "blur(8px)" }}
              transition={prefersReducedMotion ? { duration: 0.2, ease: [0.23, 1, 0.32, 1] } : {
                scale:        { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                x:            { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                y:            { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                borderRadius: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                opacity:      { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
                filter:       { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
              }}
              className="pointer-events-auto relative aspect-video w-[min(720px,90vw)] overflow-hidden"
            >
              <VideoPlayer style={{ width: "100%", height: "100%" }}>
                <VideoPlayerContent
                  src={videoModal.src}
                  autoPlay
                  slot="media"
                  className="w-full object-cover"
                  style={{ width: "100%", height: "100%" }}
                />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.15, ease: "easeOut" }}
                  onClick={closeModal}
                  className="absolute right-2 top-2 z-10 cursor-pointer rounded-full p-1 transition-colors"
                >
                  <X className="size-5 text-white" />
                </motion.span>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.15, ease: "easeOut" }}
                >
                  <VideoPlayerControlBar className="absolute bottom-0 left-1/2 flex w-full max-w-7xl -translate-x-1/2 items-center justify-center px-5 mix-blend-exclusion md:px-10 md:py-5" style={{ background: 'transparent' }}>
                    <VideoPlayerPlayButton className="h-4 bg-transparent" />
                    <VideoPlayerTimeRange className="bg-transparent" />
                    <VideoPlayerMuteButton className="size-4 bg-transparent" />
                  </VideoPlayerControlBar>
                </motion.div>
              </VideoPlayer>
              {videoModal.frameDataUrl && (
                <motion.img
                  src={videoModal.frameDataUrl}
                  alt=""
                  aria-hidden="true"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 0.35, duration: 0.15, ease: "easeOut" }}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
              )}
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      <JobExperienceModal
        experience={selectedExperience}
        originRects={originRectsRef.current}
        onCloseStart={() => setModalClosing(true)}
        onClose={() => { setSelectedExperience(null); originRectsRef.current = null; }}
        onExitComplete={() => setModalClosing(false)}
      />
    </main>
  );
}
