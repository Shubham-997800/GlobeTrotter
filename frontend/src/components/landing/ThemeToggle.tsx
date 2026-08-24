"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const CYCLE = ["light", "dark", "system"] as const;
const LABELS: Record<string, string> = {
  light: "Light mode",
  dark: "Dark mode",
  system: "System theme",
};
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const current = theme ?? "system";

  const cycle = () => {
    const idx = CYCLE.indexOf(current as (typeof CYCLE)[number]);
    setTheme(CYCLE[(idx + 1) % CYCLE.length]);
  };

  const Icon = ICONS[current] ?? Monitor;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={cycle}
          className={cn("relative", className)}
          aria-label={LABELS[current]}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current}
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute"
            >
              <Icon className="h-4.5 w-4.5" />
            </motion.span>
          </AnimatePresence>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{LABELS[current]}</TooltipContent>
    </Tooltip>
  );
}