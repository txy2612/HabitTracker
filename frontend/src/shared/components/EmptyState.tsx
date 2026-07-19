import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  children?: ReactNode;
};

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <section className="app-soft-card rounded-[28px] border border-dashed px-6 py-10 text-center">
      <div className="mx-auto max-w-md">
        <h2 className="text-xl font-semibold text-[var(--app-soft-text)]">{title}</h2>
        {children ? <div className="mt-3 text-sm leading-6 text-[var(--app-soft-muted)]">{children}</div> : null}
      </div>
    </section>
  );
}
