import { useEffect, useState } from "react";
import { Modal } from "../../../shared/components/Modal";
import type { HabitLog, HabitLogStatus } from "../../../shared/types/api.types";

export type LogNoteEditorProps = {
  date: string | null;
  log?: HabitLog;
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (input: { status: HabitLogStatus; note?: string | null }) => Promise<void> | void;
};

export function LogNoteEditor({ date, log, isOpen, isSaving = false, onClose, onSave }: LogNoteEditorProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote(log?.note ?? "");
  }, [date, log?.note, isOpen]);

  async function handleSave(status: Extract<HabitLogStatus, "done" | "missed">) {
    await onSave({
      status,
      note: note.trim() ? note.trim() : null,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={date ?? "Log"}>
      <div className="px-1 pb-1">
        <label className="grid gap-3 text-[22px] font-semibold text-slate-950">
          Note:
          <textarea
            className="min-h-16 resize-none border-0 border-b border-slate-400 bg-transparent text-base font-normal text-slate-800 outline-none focus:border-emerald-500"
            onChange={(event) => setNote(event.target.value)}
            value={note}
          />
        </label>

        <div className="mt-9 flex items-center justify-center gap-12">
          <button
            className="text-xl font-semibold text-slate-500 transition hover:text-slate-700 disabled:opacity-50"
            disabled={isSaving}
            onClick={() => handleSave("missed")}
            type="button"
          >
            Not done
          </button>
          <button
            className="text-xl font-semibold text-[#22c55e] transition hover:text-emerald-600 disabled:opacity-50"
            disabled={isSaving}
            onClick={() => handleSave("done")}
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
