import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const VARIANTS = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
} as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  variant?: "fadeUp" | "fade";
  delay?: number;
  duration?: number;
  once?: boolean;
  as?: "div" | "span" | "section" | "li" | "header" | "footer";
}

export function Reveal({
  children,
  className,
  variant = "fadeUp",
  delay = 0,
  duration = 0.5,
  once = true,
  as = "div",
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const motionProps = {
    className,
    initial: "hidden",
    whileInView: "visible",
    viewport: { once, margin: "-80px" },
    transition: {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
    variants: VARIANTS[variant],
  };

  switch (as) {
    case "span":
      return <motion.span {...motionProps}>{children}</motion.span>;
    case "section":
      return <motion.section {...motionProps}>{children}</motion.section>;
    case "li":
      return <motion.li {...motionProps}>{children}</motion.li>;
    case "header":
      return <motion.header {...motionProps}>{children}</motion.header>;
    case "footer":
      return <motion.footer {...motionProps}>{children}</motion.footer>;
    default:
      return <motion.div {...motionProps}>{children}</motion.div>;
  }
}