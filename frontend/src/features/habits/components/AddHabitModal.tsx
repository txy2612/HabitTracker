import { Modal } from "../../../shared/components/Modal";
import type { CreateHabitInput } from "../../../shared/types/api.types";
import { AddHabitForm } from "./AddHabitForm";

// 1. props expecting from parents
export type AddHabitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  onCreate: (input: CreateHabitInput) => Promise<void>;
};

// 2. receive 
export function AddHabitModal({ isOpen, onClose, onCreated, onCreate }: AddHabitModalProps) {
  
  // 3. use
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add habit">
      <AddHabitForm onCreate={onCreate} onCreated={onCreated} />
    </Modal>
  );
}
