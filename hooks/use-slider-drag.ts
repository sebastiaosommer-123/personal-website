import { useRef, useState, useEffect, RefObject } from "react";

export function useSliderDrag(
  sliderRef: RefObject<HTMLElement | null>,
  knobRef: RefObject<HTMLElement | null>
) {
  const [percentage, setPercentage] = useState(50);
  const dragging = useRef(false);

  useEffect(() => {
    const knob = knobRef.current;
    const slider = sliderRef.current;
    if (!knob || !slider) return;

    const updatePosition = (clientX: number) => {
      const rect = slider.getBoundingClientRect();
      const knobRadius = knob.offsetWidth / 2;
      const maxLeft = rect.width - knob.offsetWidth;
      const newLeft = Math.max(0, Math.min(clientX - rect.left - knobRadius, maxLeft));
      setPercentage((newLeft / maxLeft) * 100);
    };

    const onKnobDown = (e: MouseEvent | TouchEvent) => {
      dragging.current = true;
      e.preventDefault();
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    };
    const onUp = () => { dragging.current = false; };

    knob.addEventListener("mousedown", onKnobDown);
    knob.addEventListener("touchstart", onKnobDown, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    return () => {
      knob.removeEventListener("mousedown", onKnobDown);
      knob.removeEventListener("touchstart", onKnobDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [sliderRef, knobRef]);

  return percentage;
}
