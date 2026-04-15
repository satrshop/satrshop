"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center p-2 text-primary">
        <Sun size={22} className="stroke-[2.5px] opacity-50" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: isDark ? -10 : 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 text-primary hover:text-secondary transition-colors z-10 bg-background/50 rounded-full flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={22} className="stroke-[2.5px] text-primary" />
      ) : (
        <Moon size={22} className="stroke-[2.5px]" />
      )}
    </motion.button>
  );
}
