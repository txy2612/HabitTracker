import { Button } from "./Button";
import { Modal } from "./Modal";

export type ConfirmationModalProps = {
  confirmLabel: string;
  description: string;
  isConfirming?: boolean;
  isOpen: boolean;
  title: string;
  tone?: "danger" | "default";
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationModal({
  confirmLabel,
  description,
  isConfirming = false,
  isOpen,
  title,
  tone = "default",
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  const confirmVariant = tone === "danger" ? "danger" : "primary";

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="grid gap-5">
        <p className="text-sm leading-6 text-[var(--app-muted)]">{description}</p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button className="rounded-2xl px-5" disabled={isConfirming} onClick={onCancel} type="button" variant="secondary">
            Cancel
          </Button>
          <Button className="rounded-2xl px-5" disabled={isConfirming} onClick={onConfirm} type="button" variant={confirmVariant}>
            {isConfirming ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
