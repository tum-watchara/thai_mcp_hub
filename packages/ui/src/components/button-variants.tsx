import { cva, type VariantProps } from "class-variance-authority";

/** Kept outside the client `button.tsx` so server components can style links as buttons. */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
        secondary: "border border-border-strong bg-background text-foreground hover:bg-hover",
        ghost: "text-foreground hover:bg-hover",
        destructive: "bg-error text-accent-foreground hover:bg-error-text",
        "destructive-outline": "border border-border-strong bg-background text-error-text hover:bg-error-subtle",
        link: "h-auto px-0 text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 md:h-8",
        md: "h-10 px-4 md:h-9",
        lg: "h-11 px-5 md:h-10",
        icon: "size-10 md:size-9",
        "icon-sm": "size-9 md:size-8",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
