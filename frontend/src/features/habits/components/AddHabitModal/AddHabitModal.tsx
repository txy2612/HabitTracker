import { Modal } from "../../../../shared/components/Modal";
import { AddHabitForm } from "./AddHabitForm";

export type AddHabitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function AddHabitModal({ isOpen, onClose, onCreated }: AddHabitModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add habit">
      {/* TODO: Add modal actions and close behavior. */}
      <AddHabitForm onCreated={onCreated} />
    </Modal>
  );
}
