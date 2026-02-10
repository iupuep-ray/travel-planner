"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TilesProps {
  rows?: number
  cols?: number
  className?: string
}

export function Tiles({ rows = 20, cols = 20, className }: TilesProps) {
  const tiles = Array.from({ length: rows * cols }, (_, i) => i)

  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-[1]", className)}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {tiles.map((index) => (
        <motion.div
          key={index}
          className="border-brown/[0.08]"
          style={{
            borderWidth: "0.5px",
            borderStyle: "solid",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  )
}
