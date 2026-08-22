import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Globe2,
  MapPin,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FeaturedSlide } from "@/features/dashboard/dashboard.types";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

interface TravelBannerProps {
  slides: FeaturedSlide[];
}

export function TravelBanner({ slides }: TravelBannerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;
  const goNext = useCallback(
    () => setIndex((prev) => (prev + 1) % count),
    [count],
  );
  const goPrev = useCallback(
    () => setIndex((prev) => (prev - 1 + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || prefersReducedMotion || count < 2) return;
    function onVisibility() {
      if (document.hidden) setPaused(true);
      else setPaused(false);
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
  }, [paused, prefersReducedMotion, count]);

  useEffect(() => {
    if (paused || prefersReducedMotion || count < 2) return;
    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, prefersReducedMotion, count, goNext]);

  if (count === 0) return null;
  const slide = slides[index];

  return (
    <section
      aria-label="Featured destinations"
      aria-roledescription="carousel"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative h-72 overflow-hidden rounded-3xl sm:h-80 lg:h-[26rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}: ${slide.name}`}
            className="absolute inset-0"
            {...(prefersReducedMotion
              ? {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  transition: { duration: 0.25 },
                }
              : {
                  initial: { opacity: 0, x: 60 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -60 },
                  transition: { duration: 0.45, ease: "easeOut" },
                  drag: "x",
                  dragConstraints: { left: 0, right: 0 },
                  dragElastic: 0.6,
                  onDragEnd: (_event, info) => {
                    if (info.offset.x <= -80) goNext();
                    else if (info.offset.x >= 80) goPrev();
                  },
                })}
          >
            <img
              src={slide.image}
              alt={slide.imageAlt}
              loading={index === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
            {/* Legibility overlays */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10"
            />

            {/* Copy */}
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                {slide.badge}
              </span>
              <h2 className="mt-3 max-w-lg text-2xl font-bold tracking-tight drop-shadow-sm sm:text-3xl">
                {slide.name}
              </h2>
              <p className="mt-1.5 hidden max-w-md text-sm text-white/90 sm:block">
                {slide.description}
              </p>

              {/* Metadata chips */}
              <ul className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <li className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur-sm">
                  <CalendarClock className="size-3.5" aria-hidden="true" />
                  Best: {slide.bestTime}
                </li>
                <li className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur-sm">
                  <Globe2 className="size-3.5" aria-hidden="true" />
                  {slide.country}
                </li>
                <li className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur-sm">
                  <Tag className="size-3.5" aria-hidden="true" />
                  {slide.category}
                </li>
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous destination"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next destination"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Indicators + CTA row */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div role="tablist" aria-label="Choose slide" className="flex items-center gap-2">
          {slides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}: ${item.name}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === index
                  ? "w-7 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
              )}
            />
          ))}
        </div>
        <Button asChild size="sm">
          <Link to="/explore">
            <MapPin className="size-4" aria-hidden="true" />
            Explore Destination
          </Link>
        </Button>
      </div>

      {/* Screen-reader announcement of the active slide */}
      <p aria-live="polite" className="sr-only">
        Showing featured destination {index + 1} of {count}: {slide.name}
      </p>
    </section>
  );
}
