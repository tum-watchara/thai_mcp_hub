"use client";

import { Toaster as Sonner, toast } from "sonner";

/** App-wide toast host. Call `toast.success(...)` from anywhere. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      duration={3000}
      closeButton={false}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-lg !border !border-border !bg-card !text-foreground !shadow-md !text-sm !font-sans !gap-2",
          description: "!text-muted-foreground",
          success: "[&_[data-icon]]:!text-success",
          error: "[&_[data-icon]]:!text-error",
          actionButton: "!bg-accent !text-accent-foreground",
        },
      }}
    />
  );
}

export { toast };
