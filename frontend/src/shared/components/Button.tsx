import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "app-accent-bg text-white shadow-[0_12px_28px_color-mix(in_srgb,var(--app-accent)_24%,transparent)] hover:brightness-105 focus-visible:ring-[var(--app-accent)]",
  secondary: "border border-[var(--app-border)] bg-[var(--app-control-surface)] text-[var(--app-text)] hover:brightness-105 focus-visible:ring-[var(--app-secondary)]",
  ghost: "border border-[var(--app-border)] bg-[var(--app-control-surface)] text-[var(--app-text)] hover:brightness-105 focus-visible:ring-[var(--app-secondary)]",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
