import type { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  open: boolean;
};

export function Modal({ children, open }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/40 p-4">
      <div className="w-full max-w-md rounded-md bg-white p-5 shadow-xl">{children}</div>
    </div>
  );
}
