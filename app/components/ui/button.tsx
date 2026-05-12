import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "outlined"
  | "danger"
  | "warning"
  | "success";

export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background border border-transparent hover:bg-foreground/90 focus-visible:ring-foreground/40",
  outlined:
    "bg-transparent text-foreground border border-border hover:bg-foreground/5 focus-visible:ring-foreground/30",
  danger:
    "bg-red-500 text-white border border-transparent hover:bg-red-600 focus-visible:ring-red-500/40",
  warning:
    "bg-amber-500 text-white border border-transparent hover:bg-amber-600 focus-visible:ring-amber-500/40",
  success:
    "bg-emerald-500 text-white border border-transparent hover:bg-emerald-600 focus-visible:ring-emerald-500/40",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
});
