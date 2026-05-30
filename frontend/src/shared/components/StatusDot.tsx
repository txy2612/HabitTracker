type StatusDotProps = {
  active?: boolean;
};

export function StatusDot({ active = false }: StatusDotProps) {
  return (
    <span
      className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-zinc-300"}`}
      aria-hidden="true"
    />
  );
}
