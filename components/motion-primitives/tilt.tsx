'use client';

import React, { useEffect, useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  MotionStyle,
  SpringOptions,
} from 'motion/react';

export type TiltProps = {
  children: React.ReactNode;
  className?: string;
  style?: MotionStyle;
  rotationFactor?: number;
  isRevese?: boolean;
  springOptions?: SpringOptions;
};

export function Tilt({
  children,
  className,
  style,
  rotationFactor = 15,
  isRevese = false,
  springOptions,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isTouchDevice = useRef(false);
  // Accumulate readings for a stable baseline
  const baselineReadings = useRef<{ beta: number; gamma: number; alpha: number }[]>([]);
  const baseline = useRef<{ beta: number; gamma: number; alpha: number } | null>(null);
  const BASELINE_SAMPLES = 10;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const z = useMotionValue(0);

  const xSpring = useSpring(x, springOptions);
  const ySpring = useSpring(y, springOptions);
  const zSpring = useSpring(z, springOptions);

  const rotateX = useTransform(
    ySpring,
    [-0.5, 0.5],
    isRevese ? [rotationFactor, -rotationFactor] : [-rotationFactor, rotationFactor]
  );
  const rotateY = useTransform(
    xSpring,
    [-0.5, 0.5],
    isRevese ? [-rotationFactor, rotationFactor] : [rotationFactor, -rotationFactor]
  );
  const rotateZ = useTransform(
    zSpring,
    [-0.5, 0.5],
    isRevese ? [-rotationFactor, rotationFactor] : [rotationFactor, -rotationFactor]
  );

  const transform = useMotionTemplate`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;

  useEffect(() => {
    isTouchDevice.current = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouchDevice.current) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null || e.alpha === null) return;

      // Accumulate samples for a stable baseline
      if (!baseline.current) {
        baselineReadings.current.push({ beta: e.beta, gamma: e.gamma, alpha: e.alpha });
        if (baselineReadings.current.length < BASELINE_SAMPLES) return;
        const n = baselineReadings.current.length;
        baseline.current = {
          beta:  baselineReadings.current.reduce((s, r) => s + r.beta,  0) / n,
          gamma: baselineReadings.current.reduce((s, r) => s + r.gamma, 0) / n,
          alpha: baselineReadings.current.reduce((s, r) => s + r.alpha, 0) / n,
        };
        return;
      }

      // gamma: left/right (sensitive range ~±60°)
      const xPos = Math.max(-0.5, Math.min(0.5, (e.gamma - baseline.current.gamma) / 60));
      // beta: front/back — more sensitive divisor (±30° = full range)
      const yPos = Math.max(-0.5, Math.min(0.5, (e.beta  - baseline.current.beta)  / 30));
      // alpha: compass/wrist rotation (±120° = full range)
      let alphaDelta = e.alpha - baseline.current.alpha;
      // Normalize to [-180, 180] to handle 0°/360° wraparound
      if (alphaDelta > 180) alphaDelta -= 360;
      if (alphaDelta < -180) alphaDelta += 360;
      const zPos = Math.max(-0.5, Math.min(0.5, alphaDelta / 120));

      x.set(xPos);
      y.set(yPos);
      z.set(zPos);
    };

    const start = () => {
      window.addEventListener('deviceorientation', handleOrientation);
    };

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      'requestPermission' in (DeviceOrientationEvent as unknown as Record<string, unknown>)
    ) {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .then((res) => { if (res === 'granted') start(); })
        .catch(() => {});
    } else {
      start();
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [x, y, z]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        ...style,
        transform,
      }}
    >
      {children}
    </motion.div>
  );
}
