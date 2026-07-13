import type { ReactNode } from "react";

export type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  title?: string;
  onClose: () => void;
};

export function Modal({ children, isOpen, title, onClose }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-zinc-950/50 p-3 sm:place-items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-modal="true"
        className="app-solid-surface max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border p-5 shadow-[0_24px_60px_var(--app-shadow)] sm:rounded-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--app-border)] pb-4">
          {title ? <h2 className="text-lg font-semibold text-[var(--app-text)]">{title}</h2> : <span />}
          <button
            aria-label="Close modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--app-control-surface)] text-[var(--app-muted)] transition hover:brightness-95 hover:text-[var(--app-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
