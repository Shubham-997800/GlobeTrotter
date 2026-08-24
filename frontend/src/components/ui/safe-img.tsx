import * as React from "react";

import { cn } from "@/lib/utils";

interface SafeImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * Image with automatic fallback. If the primary src fails to load,
 * shows the fallbackSrc. If that also fails, shows a colored placeholder.
 */
export const SafeImg = React.forwardRef<HTMLImageElement, SafeImgProps>(
  ({ src, alt, className, fallbackSrc, onError, ...props }, ref) => {
    const [errored, setErrored] = React.useState(false);

    const handleError = React.useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (!errored && fallbackSrc) {
          setErrored(true);
          e.currentTarget.src = fallbackSrc;
        }
        onError?.(e);
      },
      [errored, fallbackSrc, onError],
    );

    if (errored && !fallbackSrc) {
      return (
        <div
          className={cn(
            "flex items-center justify-center bg-muted text-muted-foreground",
            className,
          )}
          role="img"
          aria-label={alt}
        >
          <span className="text-xs">Image unavailable</span>
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        {...props}
      />
    );
  },
);
SafeImg.displayName = "SafeImg";
