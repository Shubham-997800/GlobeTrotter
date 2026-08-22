import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "./useIsMobile";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Extra classes for the desktop dialog panel. */
  className?: string;
}

/**
 * Dialog on desktop, bottom sheet on mobile — one API, accessible
 * focus trapping and titles either way.
 */
export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "flex max-h-[92dvh] flex-col gap-0 rounded-t-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6",
            className,
          )}
        >
          <SheetHeader className="border-b border-subtle-border pb-3 text-left">
            <SheetTitle>{title}</SheetTitle>
            {description ? (
              <SheetDescription>{description}</SheetDescription>
            ) : null}
          </SheetHeader>
          <div className="-mx-1 flex-1 overflow-y-auto px-1 py-4">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[85dvh] gap-0 overflow-hidden p-6", className)}>
        <DialogHeader className="pb-3">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="-mx-1 max-h-[calc(85dvh-8rem)] overflow-y-auto px-1">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
