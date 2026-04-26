'use client';
import { cn } from '@/lib/utils';
import { AnimatePresence, Transition, motion, useReducedMotion } from 'motion/react';
import {
  Children,
  cloneElement,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export type AnimatedBackgroundProps = {
  children:
    | ReactElement<{ 'data-id': string }>[]
    | ReactElement<{ 'data-id': string }>;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
  resetKey?: unknown;
};

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
  resetKey,
}: AnimatedBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(defaultValue ?? null);
  const [rect, setRect] = useState<{ top: number; height: number } | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateRect = useCallback((id: string) => {
    const el = itemRefs.current.get(id);
    if (!el) return;
    setRect({ top: el.offsetTop, height: el.offsetHeight });
  }, []);

  const handleEnter = (id: string) => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    setActiveId(id);
    updateRect(id);
    if (onValueChange) onValueChange(id);
  };

  const handleLeave = () => {
    leaveTimeout.current = setTimeout(() => {
      setActiveId(null);
      setRect(null);
      if (onValueChange) onValueChange(null);
    }, 100);
  };

  useEffect(() => {
    if (defaultValue) updateRect(defaultValue);
  }, [defaultValue, updateRect]);

  useEffect(() => {
    setActiveId(null);
    setRect(null);
  }, [resetKey]);

  return (
    <div ref={containerRef} className='relative' onPointerUp={() => setPressedId(null)} onPointerCancel={() => setPressedId(null)}>
      <AnimatePresence>
        {rect && (
          <motion.div
            className={cn('absolute left-0 right-0 pointer-events-none', className)}
            style={{ top: rect.top, height: rect.height }}
            layout={!prefersReducedMotion}
            transition={
              prefersReducedMotion
                ? { duration: 0.15 }
                : { ...transition, scale: { duration: 0.1, ease: [0.23, 1, 0.32, 1] } }
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: (!prefersReducedMotion && pressedId !== null && pressedId === activeId) ? 0.98 : 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          />
        )}
      </AnimatePresence>
      {Children.map(children, (child: any) => {
        const id = child.props['data-id'];
        const existingOnClick = child.props.onClick;
        const interactionProps = enableHover
          ? { onMouseEnter: () => handleEnter(id), onMouseLeave: handleLeave, onPointerDown: () => setPressedId(id) }
          : { onClick: (e: React.MouseEvent) => { handleEnter(id); existingOnClick?.(e); handleLeave(); } };
        return cloneElement(child, {
          ...interactionProps,
          ref: (el: HTMLElement | null) => {
            if (el) itemRefs.current.set(id, el);
            else itemRefs.current.delete(id);
          },
        });
      })}
    </div>
  );
}
