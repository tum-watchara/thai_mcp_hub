"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";
import { cn } from "../lib/utils";

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn("text-sm font-medium text-foreground peer-disabled:opacity-60", className)}
      {...props}
    />
  );
}

interface FieldProps {
  id: string;
  label: React.ReactNode;
  helper?: React.ReactNode;
  /** Already-translated validation message. */
  error?: React.ReactNode;
  optionalLabel?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Label above, control, helper text, inline error.
 * Pass `aria-describedby={fieldDescriptionId(id)}` and `aria-invalid` to the control.
 */
export function Field({ id, label, helper, error, optionalLabel, className, children }: FieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {optionalLabel ? <span className="ml-1 font-normal text-muted-foreground">{optionalLabel}</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={fieldDescriptionId(id)} role="alert" className="text-xs text-error-text">
          {error}
        </p>
      ) : helper ? (
        <p id={fieldDescriptionId(id)} className="text-xs text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

export function fieldDescriptionId(id: string): string {
  return `${id}-description`;
}
