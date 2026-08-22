import { useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadState = "loading" | "ready" | "error";

/**
 * Cover image with real loading/error states. Shows a shimmer while the
 * file streams in, a muted block if it fails, and lazy-loads offscreen
 * covers so large grids stay cheap.
 */
export function TripImage({
  src,
  alt,
  className,
  imgClassName,
  eager = false,
}: {
  src: string;
  alt: string;
  /** Wrapper classes — owns sizing/aspect/rounding. */
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const [state, setState] = useState<LoadState>("loading");
  // Reset the load state during render when the cover changes — the
  // React-recommended alternative to a reset effect.
  const [prevSrc, setPrevSrc] = useState(src);
  if (prevSrc !== src) {
    setPrevSrc(src);
    setState("loading");
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        className,
      )}
    >
      {state === "loading" ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-background to-muted"
        />
      ) : null}
      {state === "error" ? (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground"
        >
          <ImageOff className="size-5" aria-hidden="true" />
          <span className="px-2 text-center text-[11px]">
            Cover unavailable
          </span>
        </div>
      ) : null}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setState("ready")}
        onError={() => setState("error")}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          state === "ready" ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}
