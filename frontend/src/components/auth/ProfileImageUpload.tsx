import * as React from "react";
import { Camera, Loader2, UserRound, X } from "lucide-react";

import { FieldError } from "@/components/auth/FormField";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

const ERROR_MESSAGES = {
  type: "Use a JPG, PNG or WebP image.",
  size: "Image must be smaller than 2 MB.",
  read: "Could not read that file. Try another image.",
} as const;

type UploadError = keyof typeof ERROR_MESSAGES;

interface ProfileImageUploadProps {
  /** Current image as a data URL ("" when unset). */
  value?: string;
  onChange: (dataUrl: string) => void;
}

/**
 * Avatar picker for registration: default initial avatar, upload with
 * instant preview and remove. Validation errors are announced to
 * screen readers via the linked FieldError.
 */
export function ProfileImageUpload({ value, onChange }: ProfileImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<UploadError | null>(null);
  const [isReading, setIsReading] = React.useState(false);

  const handleFile = React.useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
        setError("type");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError("size");
        return;
      }
      setIsReading(true);
      const reader = new FileReader();
      reader.onload = () => {
        onChange(typeof reader.result === "string" ? reader.result : "");
        setIsReading(false);
        setError(null);
      };
      reader.onerror = () => {
        setError("read");
        setIsReading(false);
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const removeImage = () => {
    onChange("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {value ? (
          <img
            src={value}
            alt="Your profile preview"
            className="h-20 w-20 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
            <UserRound className="h-8 w-8" aria-hidden="true" />
          </span>
        )}

        {isReading ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
            <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          </span>
        ) : (
          <>
            <label
              htmlFor="profile-image-input"
              title="Upload profile photo"
              className={cn(
                "absolute -right-1 -bottom-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full",
                "bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover active:bg-primary-active",
                "focus-within:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
              )}
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">
                {value ? "Change profile photo" : "Upload profile photo"}
              </span>
            </label>
            <input
              ref={inputRef}
              id="profile-image-input"
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={(event) => {
                handleFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </>
        )}
      </div>

      {value ? (
        <button
          type="button"
          onClick={removeImage}
          className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Remove photo
        </button>
      ) : (
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP · max 2 MB</p>
      )}

      <FieldError
        id="profile-image-error"
        message={error ? ERROR_MESSAGES[error] : undefined}
      />
    </div>
  );
}
