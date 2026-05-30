import type { HabitLogStatus } from "../../../shared/types/api.types";

export type LogNoteEditorProps = {
  date: string;
  status?: HabitLogStatus;
  note?: string | null;
  onSave: (input: { status: HabitLogStatus; note?: string | null }) => void;
};

export function LogNoteEditor({ date, status, note, onSave }: LogNoteEditorProps) {
  void date;
  void status;
  void note;
  void onSave;

  return (
    <form className="log-note-editor-placeholder">
      {/* TODO: Add status selector, note input, and save handler. */}
      <p>Log note editor</p>
    </form>
  );
}
