import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  children?: ReactNode;
};

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-zinc-300 bg-white px-6 text-center">
      <div className="max-w-sm">
        <p className="text-lg font-bold text-zinc-950">{title}</p>
        {children ? <div className="mt-2 text-sm leading-6 text-zinc-600">{children}</div> : null}
      </div>
    </div>
  );
}
