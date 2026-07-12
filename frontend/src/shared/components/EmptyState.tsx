import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  children?: ReactNode;
};

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <section className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
      <div className="mx-auto max-w-md">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        {children ? <div className="mt-3 text-sm leading-6 text-slate-500">{children}</div> : null}
      </div>
    </section>
  );
}
