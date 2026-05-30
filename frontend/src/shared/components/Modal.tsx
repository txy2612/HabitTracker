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
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-modal="true"
        className="w-full max-w-md rounded-md bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          {title ? <h2 className="text-lg font-semibold text-zinc-950">{title}</h2> : <span />}
          <button
            aria-label="Close modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
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
