import * as React from "react";
import { cn } from "../lib/utils";

export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-md border border-border-strong bg-background px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground md:h-9",
        "focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent/30",
        "disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-70",
        "aria-invalid:border-error aria-invalid:focus-visible:outline-error/30",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-md border border-border-strong bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground",
        "focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent/30",
        "disabled:cursor-not-allowed disabled:bg-subtle aria-invalid:border-error",
        className,
      )}
      {...props}
    />
  );
}
