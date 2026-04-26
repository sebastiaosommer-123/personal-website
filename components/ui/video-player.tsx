"use client";

import {
  FullscreenButton,
  MediaPlayer,
  MediaProvider,
  MuteButton,
  PlayButton,
  Time,
  TimeSlider,
  useMediaState,
} from "@vidstack/react";
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const EASE = [0.23, 1, 0.32, 1] as const;
const HIDE_DELAY_MS = 2500;
const CONTROLS_TRANSITION = "opacity 150ms cubic-bezier(0.23, 1, 0.32, 1)";

function ControlsBar({ visible }: { visible: boolean }) {
  const paused = useMediaState("paused");
  const muted = useMediaState("muted");
  const volume = useMediaState("volume");
  const fullscreen = useMediaState("fullscreen");

  return (
    <div
      className="absolute inset-x-0 bottom-0"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: CONTROLS_TRANSITION,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      <div className="relative px-4 pb-4 pt-8 flex flex-col gap-2">

        <TimeSlider.Root className="group relative flex items-center w-full h-4 cursor-pointer">
          <TimeSlider.Track className="relative h-[2px] w-full rounded-full bg-white/20 group-hover:h-[3px] transition-[height] duration-150">
            <TimeSlider.TrackFill className="absolute h-full bg-white/90 rounded-full will-change-[width]" style={{ width: 'var(--slider-fill)' }} />
            <TimeSlider.Progress className="absolute h-full bg-white/35 rounded-full will-change-[width]" style={{ width: 'var(--slider-progress)' }} />
          </TimeSlider.Track>
          <TimeSlider.Thumb className="absolute w-[10px] h-[10px] -translate-x-1/2 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 will-change-transform" style={{ left: 'var(--slider-fill)' }} />
        </TimeSlider.Root>

        <div className="flex items-center gap-4">
          <PlayButton className="flex items-center justify-center text-white/90 hover:text-white transition-colors duration-100 cursor-pointer">
            {paused
              ? <Play size={16} strokeWidth={1.75} className="fill-current" />
              : <Pause size={16} strokeWidth={1.75} className="fill-current" />
            }
          </PlayButton>

          <div className="flex items-center text-[14px] tabular-nums text-white/60 tracking-wide select-none">
            <Time type="current" />
            <span className="mx-0.5 opacity-60">/</span>
            <Time type="duration" />
          </div>

          <div className="flex-1" />

          <MuteButton className="flex items-center justify-center text-white/70 hover:text-white transition-colors duration-100 cursor-pointer">
            {muted || volume === 0
              ? <VolumeX size={20} strokeWidth={1.75} />
              : <Volume2 size={20} strokeWidth={1.75} />
            }
          </MuteButton>

          <FullscreenButton className="flex items-center justify-center text-white/70 hover:text-white transition-colors duration-100 cursor-pointer">
            {fullscreen
              ? <Minimize size={20} strokeWidth={1.75} />
              : <Maximize size={20} strokeWidth={1.75} />
            }
          </FullscreenButton>
        </div>
      </div>
    </div>
  );
}

interface VideoPlayerProps {
  src: string;
  onClose: () => void;
  controlsDelay?: number;
}

export function VideoPlayer({ src, onClose, controlsDelay = 0.35 }: VideoPlayerProps) {
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isPausedRef = useRef(false);
  const hasAnimatedIn = useRef(false);

  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!isPausedRef.current) setControlsVisible(false);
    }, HIDE_DELAY_MS);
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  return (
    <MediaPlayer
      src={src}
      autoPlay
      className="relative w-full h-full"
      onMouseMove={showControls}
      onMouseEnter={showControls}
      onPause={() => {
        isPausedRef.current = true;
        setControlsVisible(true);
        clearTimeout(hideTimer.current);
      }}
      onPlay={() => {
        isPausedRef.current = false;
        showControls();
      }}
      onMouseLeave={() => {
        if (!isPausedRef.current && hasAnimatedIn.current) {
          clearTimeout(hideTimer.current);
          setControlsVisible(false);
        }
      }}
    >
      <MediaProvider className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

      {/* Close button — same className as job-experience-modal.tsx:252 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: controlsDelay, duration: 0.15, ease: EASE }}
        onClick={onClose}
        className="absolute top-3 right-3 z-10 rounded-full p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white active:scale-[0.97] transition-[transform,background-color] duration-150"
        aria-label="Close"
      >
        <X size={16} />
      </motion.button>

      {/* Controls wrapper — one-shot fade-in after morph settles, then hover show/hide inside */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: controlsDelay, duration: 0.15, ease: EASE }}
        onAnimationComplete={() => {
          hasAnimatedIn.current = true;
          scheduleHide();
        }}
      >
        <ControlsBar visible={controlsVisible} />
      </motion.div>
    </MediaPlayer>
  );
}
