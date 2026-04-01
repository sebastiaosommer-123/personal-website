"use client"

import React, { useRef, useState, useCallback } from "react"
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

    const [hovered, setHovered] = useState(false)
    const [origin, setOrigin] = useState<"left" | "right">("left")

    const getDirection = useCallback((e: React.MouseEvent) => {
      if (!innerRef.current) return "left" as const
      const rect = innerRef.current.getBoundingClientRect()
      return e.clientX < rect.left + rect.width / 2 ? ("left" as const) : ("right" as const)
    }, [])

    return (
      <Tag
        ref={mergedRef}
        onMouseEnter={(e: React.MouseEvent) => {
          setOrigin(getDirection(e))
          setHovered(true)
          externalOnMouseEnter?.(e)
        }}
        onMouseLeave={(e: React.MouseEvent) => {
          setOrigin(getDirection(e))
          setHovered(false)
          externalOnMouseLeave?.(e)
        }}
        className={cn(
          "relative inline-block",
          "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-['']",
          "before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
          hovered ? "before:scale-x-100" : "before:scale-x-0",
          origin === "left" ? "before:origin-left" : "before:origin-right",
          className,
        )}
        style={style}
        {...props}
      >
        {children}
      </Tag>
    )
  }
)
