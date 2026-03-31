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

const GYRO_SPRING = { stiffness: 40, damping: 15 };
const EMA_SMOOTHING = 0.15;

export function Tilt({
  children,
  className,
  style,
  rotationFactor = 15,
  isRevese = false,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isTouchDevice = useRef(false);
  const baselineReadings = useRef<{ beta: number; gamma: number }[]>([]);
  const baseline = useRef<{ beta: number; gamma: number } | null>(null);
  const smoothed = useRef({ x: 0, y: 0 });
  const BASELINE_SAMPLES = 10;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, GYRO_SPRING);
  const ySpring = useSpring(y, GYRO_SPRING);

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

  const transform = useMotionTemplate`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  useEffect(() => {
    isTouchDevice.current = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouchDevice.current) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;

      // Build stable baseline from averaged samples
      if (!baseline.current) {
        baselineReadings.current.push({ beta: e.beta, gamma: e.gamma });
        if (baselineReadings.current.length < BASELINE_SAMPLES) return;
        const n = baselineReadings.current.length;
        baseline.current = {
          beta:  baselineReadings.current.reduce((s, r) => s + r.beta,  0) / n,
          gamma: baselineReadings.current.reduce((s, r) => s + r.gamma, 0) / n,
        };
        return;
      }

      // Raw normalized deltas
      const rawX = Math.max(-0.5, Math.min(0.5, (e.gamma - baseline.current.gamma) / 60));
      const rawY = Math.max(-0.5, Math.min(0.5, (e.beta  - baseline.current.beta)  / 40));

      // Exponential moving average to kill sensor noise
      smoothed.current.x = EMA_SMOOTHING * rawX + (1 - EMA_SMOOTHING) * smoothed.current.x;
      smoothed.current.y = EMA_SMOOTHING * rawY + (1 - EMA_SMOOTHING) * smoothed.current.y;

      x.set(smoothed.current.x);
      y.set(smoothed.current.y);
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
  }, [x, y]);

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
