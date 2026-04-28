"use client"

import React, { useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

type DirectionalUnderlineProps = {
  as?: "span" | "a"
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  href?: string
  target?: string
  rel?: string
  onClick?: (e: React.MouseEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseLeave?: (e: React.MouseEvent) => void
  onMouseMove?: (e: React.MouseEvent) => void
}

export const DirectionalUnderline = React.forwardRef<HTMLElement, DirectionalUnderlineProps>(
  function DirectionalUnderline(
    {
      as: Tag = "span",
      className,
      style,
      children,
      onMouseEnter: externalOnMouseEnter,
      onMouseLeave: externalOnMouseLeave,
      ...props
    },
    forwardedRef
  ) {
    const innerRef = useRef<HTMLElement>(null)
    const underlineRef = useRef<HTMLSpanElement>(null)

    const mergedRef = useCallback(
      (node: HTMLElement | null) => {
        innerRef.current = node
        if (typeof forwardedRef === "function") {
          forwardedRef(node)
        } else if (forwardedRef) {
          forwardedRef.current = node
        }
      },
      [forwardedRef]
    )

    const prefersReducedMotion = () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    return (
      <Tag
        ref={mergedRef}
        onMouseEnter={(e: React.MouseEvent) => {
          if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return;
          const el = underlineRef.current
          const host = innerRef.current
          if (el && host) {
            const rect = host.getBoundingClientRect()
            const x = ((e.clientX - rect.left) / rect.width) * 100
            if (prefersReducedMotion()) {
              el.style.transition = "none"
              el.style.clipPath = "inset(0 0 0 0)"
            } else {
              el.style.transition = "none"
              el.style.clipPath = `inset(0 ${100 - x}% 0 ${x}%)`
              void el.offsetWidth // force reflow to commit reset before transition starts
              requestAnimationFrame(() => {
                el.style.transition = "clip-path 150ms cubic-bezier(0.23,1,0.32,1)"
                el.style.clipPath = "inset(0 0 0 0)"
              })
            }
          }
          externalOnMouseEnter?.(e)
        }}
        onMouseLeave={(e: React.MouseEvent) => {
          if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return;
          const el = underlineRef.current
          const host = innerRef.current
          if (el && host) {
            const rect = host.getBoundingClientRect()
            const x = ((e.clientX - rect.left) / rect.width) * 100
            if (prefersReducedMotion()) {
              el.style.transition = "none"
              el.style.clipPath = `inset(0 ${100 - x}% 0 ${x}%)`
            } else {
              el.style.transition = "clip-path 150ms cubic-bezier(0.23,1,0.32,1)"
              el.style.clipPath = `inset(0 ${100 - x}% 0 ${x}%)`
            }
          }
          externalOnMouseLeave?.(e)
        }}
        className={cn("relative inline-block", className)}
        style={style}
        {...props}
      >
        {children}
        <span
          ref={underlineRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-[1.5em] h-px w-full bg-current"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        />
      </Tag>
    )
  }
)
