"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type TextShimmerProps = {
  children: string;
  className?: string;
  duration?: number;
};

export function TextShimmer({ children, className, duration = 2 }: TextShimmerProps) {
  return (
    <motion.span
      className={cn(
        "relative inline-flex overflow-hidden bg-[length:250%_100%,auto] bg-clip-text text-transparent",
        "[--base-color:#a1a1aa] [--shimmer-color:#18191C]",
        "dark:[--base-color:#71717a] dark:[--shimmer-color:#E8E9EB]",
        "[background-image:linear-gradient(90deg,#0000_calc(50%-2em),var(--shimmer-color),#0000_calc(50%+2em)),linear-gradient(var(--base-color),var(--base-color))]",
        className
      )}
      initial={{ backgroundPosition: "100% center" }}
      animate={{ backgroundPosition: "0% center" }}
      transition={{ repeat: Infinity, duration, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}
