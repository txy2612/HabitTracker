import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  labelClassName?: string;
};

export function Input({ label, id, className = "", labelClassName = "", ...props }: InputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replaceAll(" ", "-");

  return (
    <label
      className={`grid gap-2 text-sm font-semibold text-[var(--app-text)] ${labelClassName}`}
      htmlFor={inputId}
    >
      <span>{label}</span>
      <input
        className={`h-10 rounded-md border border-[var(--app-border)] bg-[var(--app-modal-surface)] px-3 text-sm text-[var(--app-text)] caret-[var(--app-accent)] outline-none transition placeholder:text-[var(--app-muted)] focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent-soft)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        id={inputId}
        {...props}
      />
    </label>
  );
}
