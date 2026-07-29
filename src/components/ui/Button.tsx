import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "brand" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  brand:
    "bg-gradient-to-r from-[var(--color-brand)] via-[var(--color-brand-deep)] to-[var(--color-accent)] text-white shadow-md hover:shadow-lg hover:shadow-[rgba(0,185,217,0.3)] hover:-translate-y-[1px] active:translate-y-0 focus-visible:outline-brand",
  primary:
    "bg-brand-ink text-white shadow-xs hover:bg-[#005f76] hover:shadow-md hover:-translate-y-[0.5px] active:translate-y-0 focus-visible:outline-brand-ink",
  secondary:
    "border border-line bg-surface text-ink shadow-xs hover:bg-slate-50 hover:border-line-strong hover:text-ink focus-visible:outline-brand",
  ghost: "text-ink-muted hover:bg-slate-100/70 hover:text-ink focus-visible:outline-brand",
  danger: "bg-red-600 text-white shadow-xs hover:bg-red-700 hover:shadow-md active:translate-y-0 focus-visible:outline-red-600",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs rounded-lg",
  md: "h-11 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl font-bold",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      )}
      {children}
    </button>
  );
}
