import { Modal } from "../../../shared/components/Modal";
import type { CreateHabitInput } from "../../../shared/types/api.types";
import { AddHabitForm } from "./AddHabitForm";

export type AddHabitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  onCreate: (input: CreateHabitInput) => Promise<void>;
};

export function AddHabitModal({ isOpen, onClose, onCreated, onCreate }: AddHabitModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add habit">
      <AddHabitForm onCreate={onCreate} onCreated={onCreated} />
    </Modal>
  );
}
