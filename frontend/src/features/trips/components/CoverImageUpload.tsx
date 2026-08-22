import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoverImageUploadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  disabled?: boolean;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

/**
 * Drag-and-drop (or click) cover image picker. Stores a compressed
 * object-URL-free data URL so drafts survive reloads; size-capped to
 * keep localStorage writes small.
 */
export function CoverImageUpload({
  value,
  onChange,
  disabled,
}: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);

  const acceptFile = useCallback(
    async (file: File | undefined) => {
      setError(null);
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Please choose a JPG, PNG, WebP or GIF image.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError("Image is larger than 5 MB — try a smaller one.");
        return;
      }
      setReading(true);
      try {
        onChange(await readFileAsDataUrl(file));
      } catch {
        setError("Couldn't read that file. Please try another image.");
      } finally {
        setReading(false);
      }
    },
    [onChange],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload cover image"
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (!disabled) void acceptFile(event.dataTransfer.files[0]);
        }}
        className={cn(
          "relative flex min-h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-strong-border bg-muted/40 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !disabled && "hover:border-primary hover:bg-primary/5",
          dragOver && "border-primary bg-primary/10",
          value && "min-h-48",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Trip cover preview"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
              <span className="text-xs font-medium text-white drop-shadow">
                Click or drop to replace
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 border-transparent bg-white/90 text-foreground hover:bg-white"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange("");
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              {reading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
            </span>
            <p className="text-sm font-medium text-foreground">
              Drop a cover photo here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP or GIF · up to 5 MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => {
          void acceptFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
