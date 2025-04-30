"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useLayoutEffect, useState } from "react"
import { motion } from "motion/react"
import { Button } from "./ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  return mounted && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <Button variant="ghost" className="h-9 w-9"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme === "dark" ? <Moon /> : <Sun />}
      </Button>
    </motion.div>
  )
}
