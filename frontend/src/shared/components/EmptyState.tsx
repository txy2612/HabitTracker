import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  children?: ReactNode;
};

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <section className="empty-state-placeholder">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
