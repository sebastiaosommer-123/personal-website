"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

export const AnimatedThemeToggler = ({
  className,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle("dark")
    localStorage.setItem("theme", newTheme ? "dark" : "light")
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
