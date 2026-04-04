import { useRef, useState, useEffect, RefObject } from "react";

export function useRotaryKnob(knobRef: RefObject<HTMLElement | null>) {
  const [angle, setAngle] = useState(0);
  const state = useRef({ isRotating: false, startAngle: 0, currentAngle: 0, center: { x: 0, y: 0 } });

  useEffect(() => {
    const el = knobRef.current;
    if (!el) return;

    const getAngle = (x: number, y: number) =>
      Math.atan2(y - state.current.center.y, x - state.current.center.x) * (180 / Math.PI);

    const onStart = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const rect = el.getBoundingClientRect();
      state.current.center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      state.current.startAngle = getAngle(clientX, clientY) - state.current.currentAngle;
      state.current.isRotating = true;
      e.preventDefault();
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!state.current.isRotating) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const newAngle = getAngle(clientX, clientY) - state.current.startAngle;
      state.current.currentAngle = newAngle;
      setAngle(newAngle);
    };

    const onEnd = () => { state.current.isRotating = false; };

    el.addEventListener("mousedown", onStart);
    el.addEventListener("touchstart", onStart, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);

    return () => {
      el.removeEventListener("mousedown", onStart);
      el.removeEventListener("touchstart", onStart);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, [knobRef]);

  return angle;
}
