import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replaceAll(" ", "-");

  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-800" htmlFor={inputId}>
      <span>{label}</span>
      <input
        className={`h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 ${className}`}
        id={inputId}
        {...props}
      />
    </label>
  );
}
