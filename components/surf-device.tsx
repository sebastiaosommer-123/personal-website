"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useDeviceAudio } from "@/hooks/use-device-audio";
import { useRotaryKnob } from "@/hooks/use-rotary-knob";
import { useSliderDrag } from "@/hooks/use-slider-drag";

const VIDEOS = [
  "https://res.cloudinary.com/dcewfztrv/video/upload/q_auto,f_auto,vc_auto/v1775322457/1_l2hxt0.mov",
  "https://res.cloudinary.com/dcewfztrv/video/upload/q_auto,f_auto,vc_auto/v1775322120/2_axbpw4.mov",
  "https://res.cloudinary.com/dcewfztrv/video/upload/q_auto,f_auto,vc_auto/v1775322760/3_q5yufj.mp4",
];
const VOLUME_MAX = 16;

export interface SurfDeviceProps {
  onClose: () => void;
}

export function SurfDevice({ onClose }: SurfDeviceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rotaryRef = useRef<HTMLDivElement>(null);
  const slider1Ref = useRef<HTMLDivElement>(null);
  const knob1Ref = useRef<HTMLDivElement>(null);
  const slider2Ref = useRef<HTMLDivElement>(null);
  const knob2Ref = useRef<HTMLDivElement>(null);
  const volIndicatorRef = useRef<HTMLDivElement>(null);
  const volTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasInteractedRef = useRef(false);

  const [volumeLevel, setVolumeLevel] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const { playClick, playVolumeClick } = useDeviceAudio();
  const knobAngle = useRotaryKnob(rotaryRef);
  const slider1Pct = useSliderDrag(slider1Ref, knob1Ref);
  const slider2Pct = useSliderDrag(slider2Ref, knob2Ref);

  // Init video on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.src = VIDEOS[0];
    video.muted = true;
    video.volume = 0;
    video.play().catch(() => {});
  }, []);

  // Volume indicator fade
  useEffect(() => {
    if (!hasInteractedRef.current) return;
    const el = volIndicatorRef.current;
    if (!el) return;
    el.style.transition = "opacity 0.2s ease";
    el.style.opacity = "1";
    if (volTimerRef.current) clearTimeout(volTimerRef.current);
    volTimerRef.current = setTimeout(() => {
      if (volIndicatorRef.current) {
        volIndicatorRef.current.style.transition = "opacity 0.4s ease";
        volIndicatorRef.current.style.opacity = "0";
      }
    }, 1000);
  }, [volumeLevel]);

  const loadVideo = useCallback((index: number) => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentVideoIndex(index);
    video.src = VIDEOS[index];
    video.play().catch(() => {});
  }, []);

  const handlePrev = useCallback(() => {
    playClick();
    loadVideo((currentVideoIndex - 1 + VIDEOS.length) % VIDEOS.length);
  }, [playClick, loadVideo, currentVideoIndex]);

  const handlePlayPause = useCallback(() => {
    playClick();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, [playClick]);

  const handleNext = useCallback(() => {
    playClick();
    loadVideo((currentVideoIndex + 1) % VIDEOS.length);
  }, [playClick, loadVideo, currentVideoIndex]);

  const handleVolumeUp = useCallback(() => {
    hasInteractedRef.current = true;
    playVolumeClick();
    setVolumeLevel((prev) => {
      const next = Math.min(VOLUME_MAX, prev + 1);
      const video = videoRef.current;
      if (video) {
        video.volume = Math.pow(next / VOLUME_MAX, 3);
        video.muted = next === 0;
      }
      return next;
    });
  }, [playVolumeClick]);

  const handleVolumeDown = useCallback(() => {
    hasInteractedRef.current = true;
    playVolumeClick();
    setVolumeLevel((prev) => {
      const next = Math.max(0, prev - 1);
      const video = videoRef.current;
      if (video) {
        video.volume = Math.pow(next / VOLUME_MAX, 3);
        video.muted = next === 0;
      }
      return next;
    });
  }, [playVolumeClick]);

  return (
    <div className="relative">
      {/* Volume Level Indicator */}
      <div
        ref={volIndicatorRef}
        className="absolute flex flex-col-reverse gap-[3px] z-[15]"
        style={{ right: 12, top: 60, opacity: 0 }}
      >
        {Array.from({ length: 16 }, (_, i) => i + 1).map((level) => (
          <div
            key={level}
            className="w-[4px] h-[4px] rounded-full"
            style={{
              backgroundColor:
                level <= volumeLevel
                  ? "rgba(255,255,255,0.75)"
                  : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>

      {/* Volume Buttons - Right Outer Edge */}
      <div className="absolute -right-[4px] top-[60px] flex flex-col gap-3 z-[5]">
        <button
          className="w-[6px] h-[56px] bg-gunmetal-600/80 rounded-r shadow-[inset_0_1px_0_rgba(255,255,255,0.15),-2px_2px_6px_rgba(0,0,0,0.5)] active:-translate-x-[2px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),-1px_1px_4px_rgba(0,0,0,0.6)] transition-transform cursor-pointer"
          aria-label="Volume Up"
          onPointerDown={handleVolumeUp}
        />
        <button
          className="w-[6px] h-[56px] bg-gunmetal-600/80 rounded-r shadow-[inset_0_1px_0_rgba(255,255,255,0.15),-2px_2px_6px_rgba(0,0,0,0.5)] active:-translate-x-[2px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),-1px_1px_4px_rgba(0,0,0,0.6)] transition-transform cursor-pointer"
          aria-label="Volume Down"
          onPointerDown={handleVolumeDown}
        />
      </div>

      {/* Device Body */}
      <div className="relative w-[420px] h-auto metallic-grain rounded-[32px] flex flex-col border border-gunmetal-800 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.06),4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.08),inset_-2px_-2px_4px_rgba(0,0,0,0.3)] font-mono overflow-hidden pb-7 z-[10]">

        {/* Screen */}
        <div className="relative w-full h-[220px] bg-black shrink-0 border-b border-gunmetal-900 z-20">
          <div className="absolute inset-[2.5px] rounded-t-[29.5px] rounded-b-[4px] overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full"
              style={{ objectFit: "cover" }}
              muted
              loop
              playsInline
              autoPlay
            />
          </div>
          <div className="absolute inset-[2.5px] border-[1.5px] border-gunmetal-800 rounded-t-[29.5px] rounded-b-[4px] pointer-events-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.5)]" />
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col px-7 pt-7 z-10">

          {/* Speaker grille */}
          <div className="w-full h-[30px] mb-4 mt-1 opacity-80 px-1">
            <svg width="100%" height="30" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hole-pattern" width="5" height="5" patternUnits="userSpaceOnUse">
                  <circle cx="2.5" cy="2.5" r="1.2" fill="#1f2125" />
                  <circle cx="2.5" cy="2.8" r="1.2" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hole-pattern)" />
            </svg>
          </div>

          {/* Playback buttons */}
          <div className="w-full flex items-center justify-between px-1 mb-2">
            <button
              className="w-16 h-16 rounded-full bg-gunmetal-900 border border-gunmetal-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center cursor-pointer active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
              aria-label="Previous"
              onClick={handlePrev}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.0001 16.8111C21.0001 17.6751 20.0671 18.2171 19.3171 17.7881L12.2091 13.7271C12.0368 13.6287 11.8936 13.4865 11.7939 13.315C11.6943 13.1434 11.6418 12.9485 11.6418 12.7501C11.6418 12.5517 11.6943 12.3568 11.7939 12.1852C11.8936 12.0137 12.0368 11.8715 12.2091 11.7731L19.3171 7.7121C19.4882 7.61437 19.682 7.56328 19.879 7.56397C20.0761 7.56466 20.2695 7.61709 20.4399 7.71602C20.6103 7.81495 20.7518 7.9569 20.8501 8.12768C20.9484 8.29845 21.0001 8.49205 21.0001 8.6891V16.8111ZM11.2501 16.8111C11.2501 17.6751 10.3171 18.2171 9.56709 17.7881L2.45909 13.7271C2.28678 13.6287 2.14356 13.4865 2.04394 13.315C1.94432 13.1434 1.89185 12.9485 1.89185 12.7501C1.89185 12.5517 1.94432 12.3568 2.04394 12.1852C2.14356 12.0137 2.28678 11.8715 2.45909 11.7731L9.56709 7.7121C9.73819 7.61437 9.93196 7.56328 10.129 7.56397C10.3261 7.56466 10.5195 7.61709 10.6899 7.71602C10.8603 7.81495 11.0018 7.9569 11.1001 8.12768C11.1984 8.29845 11.2501 8.49205 11.2501 8.6891V16.8111Z" stroke="#8a919c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              className="w-16 h-16 rounded-full bg-gunmetal-900 border border-gunmetal-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center cursor-pointer active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
              aria-label="Play/Pause"
              onClick={handlePlayPause}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 7.5V18M15 7.5V18M3 16.811V8.69C3 7.826 3.933 7.284 4.683 7.713L11.791 11.774C11.9633 11.8724 12.1065 12.0146 12.2062 12.1861C12.3058 12.3577 12.3582 12.5526 12.3582 12.751C12.3582 12.9494 12.3058 13.1443 12.2062 13.3159C12.1065 13.4874 11.9633 13.6296 11.791 13.728L4.683 17.789C4.51182 17.8868 4.31796 17.9379 4.12082 17.9371C3.92369 17.9364 3.73021 17.8839 3.55976 17.7848C3.38932 17.6858 3.24789 17.5437 3.14965 17.3728C3.05141 17.2019 2.9998 17.0081 3 16.811Z" stroke="#8a919c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              className="w-16 h-16 rounded-full bg-gunmetal-900 border border-gunmetal-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center cursor-pointer active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
              aria-label="Next"
              onClick={handleNext}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8.68907C3 7.82507 3.933 7.28307 4.683 7.71207L11.791 11.7731C11.9633 11.8714 12.1065 12.0136 12.2061 12.1852C12.3058 12.3568 12.3582 12.5517 12.3582 12.7501C12.3582 12.9485 12.3058 13.1434 12.2061 13.3149C12.1065 13.4865 11.9633 13.6287 11.791 13.7271L4.683 17.7881C4.5119 17.8858 4.31812 17.9369 4.12107 17.9362C3.92402 17.9355 3.73061 17.8831 3.5602 17.7842C3.38978 17.6852 3.24833 17.5433 3.15002 17.3725C3.05171 17.2017 2.99998 17.0081 3 16.8111V8.68907ZM12.75 8.68907C12.75 7.82507 13.683 7.28307 14.433 7.71207L21.541 11.7731C21.7133 11.8714 21.8565 12.0136 21.9562 12.1852C22.0558 12.3568 22.1082 12.5517 22.1082 12.7501C22.1082 12.9485 22.0558 13.1434 21.9562 13.3149C21.8565 13.4865 21.7133 13.6287 21.541 13.7271L14.433 17.7881C14.2619 17.8858 14.0681 17.9369 13.8711 17.9362C13.674 17.9355 13.4806 17.8831 13.3102 17.7842C13.1398 17.6852 12.9983 17.5433 12.9 17.3725C12.8017 17.2017 12.75 17.0081 12.75 16.8111V8.68907Z" stroke="#8a919c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              className="w-16 h-16 rounded-full bg-gunmetal-900 border border-gunmetal-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center cursor-pointer active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
              aria-label="Power"
              onClick={() => { playClick(); onClose(); }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25C12.1989 2.25 12.3897 2.32902 12.5303 2.46967C12.671 2.61032 12.75 2.80109 12.75 3V12C12.75 12.1989 12.671 12.3897 12.5303 12.5303C12.3897 12.671 12.1989 12.75 12 12.75C11.8011 12.75 11.6103 12.671 11.4697 12.5303C11.329 12.3897 11.25 12.1989 11.25 12V3C11.25 2.80109 11.329 2.61032 11.4697 2.46967C11.6103 2.32902 11.8011 2.25 12 2.25ZM6.166 5.106C6.30645 5.24663 6.38534 5.43725 6.38534 5.636C6.38534 5.83475 6.30645 6.02537 6.166 6.166C5.01232 7.31982 4.22669 8.78984 3.90845 10.3902C3.5902 11.9905 3.75364 13.6492 4.37809 15.1566C5.00255 16.6641 6.05997 17.9525 7.41665 18.859C8.77334 19.7654 10.3683 20.2493 12 20.2493C13.6317 20.2493 15.2267 19.7654 16.5833 18.859C17.94 17.9525 18.9975 16.6641 19.6219 15.1566C20.2464 13.6492 20.4098 11.9905 20.0916 10.3902C19.7733 8.78984 18.9877 7.31982 17.834 6.166C17.7603 6.09734 17.7012 6.01454 17.6602 5.92254C17.6192 5.83054 17.5972 5.73123 17.5954 5.63052C17.5936 5.52982 17.6122 5.42979 17.6499 5.3364C17.6876 5.24301 17.7437 5.15818 17.815 5.08696C17.8862 5.01574 17.971 4.9596 18.0644 4.92188C18.1578 4.88416 18.2578 4.86563 18.3585 4.86741C18.4592 4.86919 18.5585 4.89123 18.6505 4.93222C18.7425 4.97321 18.8253 5.03231 18.894 5.106C22.702 8.913 22.702 15.086 18.894 18.894C15.087 22.702 8.914 22.702 5.106 18.894C1.298 15.087 1.298 8.914 5.106 5.106C5.24663 4.96555 5.43725 4.88666 5.636 4.88666C5.83475 4.88666 6.02537 4.96555 6.166 5.106Z" fill="#8a919c" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
