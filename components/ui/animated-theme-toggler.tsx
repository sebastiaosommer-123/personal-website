"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

export const AnimatedThemeToggler = ({
  className,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn("opacity-40 hover:opacity-100 transition-opacity duration-200", className)}
      {...props}
    >
      {isDark
        ? <Sun size={20} strokeWidth={1.5} />
        : <Moon size={20} strokeWidth={1.5} />
      }
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
