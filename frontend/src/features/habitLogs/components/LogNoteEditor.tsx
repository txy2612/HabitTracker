import { useEffect, useState } from "react";
import { Modal } from "../../../shared/components/Modal";
import type {
  HabitLog,
  HabitLogStatus,
} from "../../../shared/types/api.types";

const HELPED_TAGS = [
  "Routine",
  "Reminder",
  "Good mood",
];

const BLOCKED_TAGS = [
  "Busy",
  "Forgot",
  "Tired",
];

const STRUCTURED_NOTE_PREFIX = "habit-log-v1:";

type StructuredNoteState = {
  helpedTags: string[];
  blockedTags: string[];
  additionalNotes: string;
};

export type LogNoteEditorProps = {
  date: string | null;
  log?: HabitLog;
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (input: {
    status: HabitLogStatus;
    note?: string | null;
  }) => Promise<void> | void;
};

export function LogNoteEditor({
  date,
  log,
  isOpen,
  isSaving = false,
  onClose,
  onSave,
}: LogNoteEditorProps) {
  const [helpedTags, setHelpedTags] = useState<string[]>([]);
  const [blockedTags, setBlockedTags] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  /*
   * Whenever a different date or log is opened,
   * load its saved tags and notes into the form.
   */
  useEffect(() => {
    const parsedNote = parseStructuredNote(log?.note ?? null);

    setHelpedTags(parsedNote.helpedTags);
    setBlockedTags(parsedNote.blockedTags);
    setAdditionalNotes(parsedNote.additionalNotes);
  }, [date, log?.note, isOpen]);

  /*
   * Add the tag if it is not selected.
   * Remove the tag if it is already selected.
   */
  function toggleTag(section: "helped" | "blocked", tag: string) {
    const setTags =
      section === "helped"
        ? setHelpedTags
        : setBlockedTags;

    setTags((currentTags) => {
      const isSelected = currentTags.includes(tag);

      if (isSelected) {
        return currentTags.filter(
          (currentTag) => currentTag !== tag,
        );
      }

      return [...currentTags, tag];
    });
  }

  /*
   * Save either "done" or "missed",
   * together with the selected tags and notes.
   */
  async function handleSave(
    status: Extract<HabitLogStatus, "done" | "missed">,
  ) {
    const note = serializeStructuredNote({
      helpedTags,
      blockedTags,
      additionalNotes,
    });

    await onSave({
      status,
      note,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={date ?? "Log habit"}
    >
      <div className="grid gap-6 px-1 pb-1">
        {/* Optional notes section */}
        <section className="grid gap-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
          <div>
            <h3 className="text-base font-semibold text-slate-950">
              Notes
              <span className="ml-1 font-normal text-slate-500">
                (optional)
              </span>
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add some quick context about today.
            </p>
          </div>

          {/* Positive tags */}
          <div className="grid gap-3">
            <span className="text-sm font-semibold text-emerald-700">
              Helped
            </span>

            <div className="flex flex-wrap gap-2">
              {HELPED_TAGS.map((tag) => {
                const isSelected = helpedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleTag("helped", tag)}
                    className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-emerald-200 bg-white text-emerald-700 hover:border-emerald-400"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Negative tags */}
          <div className="grid gap-3 border-t border-dashed border-slate-200 pt-4">
            <span className="text-sm font-semibold text-rose-700">
              Got in the way
            </span>

            <div className="flex flex-wrap gap-2">
              {BLOCKED_TAGS.map((tag) => {
                const isSelected = blockedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleTag("blocked", tag)}
                    className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "border-rose-600 bg-rose-600 text-white"
                        : "border-rose-200 bg-white text-rose-700 hover:border-rose-400"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Free-text notes */}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Anything worth remembering?
            </span>

            <textarea
              value={additionalNotes}
              onChange={(event) =>
                setAdditionalNotes(event.target.value)
              }
              placeholder="Add a short note..."
              className="min-h-24 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </section>

        {/* Save buttons */}
        <div className="mt-3 flex items-center justify-center gap-12">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave("missed")}
            className="text-xl font-semibold text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Not done
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave("done")}
            className="text-xl font-semibold text-emerald-500 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

/*
 * Convert the saved note string back into:
 *
 * {
 *   helpedTags: [],
 *   blockedTags: [],
 *   additionalNotes: ""
 * }
 */
function parseStructuredNote(
  note: string | null,
): StructuredNoteState {
  if (!note) {
    return createEmptyStructuredNote();
  }

  /*
   * Older notes may contain only normal text.
   * Treat that text as an additional note.
   */
  if (!note.startsWith(STRUCTURED_NOTE_PREFIX)) {
    return {
      helpedTags: [],
      blockedTags: [],
      additionalNotes: note,
    };
  }

  try {
    const savedJson = note.slice(
      STRUCTURED_NOTE_PREFIX.length,
    );

    const parsedValue = JSON.parse(
      savedJson,
    ) as Partial<StructuredNoteState>;

    return {
      helpedTags: sanitizeTagList(
        parsedValue.helpedTags,
      ),
      blockedTags: sanitizeTagList(
        parsedValue.blockedTags,
      ),
      additionalNotes:
        typeof parsedValue.additionalNotes === "string"
          ? parsedValue.additionalNotes
          : "",
    };
  } catch {
    /*
     * If the structured note cannot be parsed,
     * preserve it as normal text instead of losing it.
     */
    return {
      helpedTags: [],
      blockedTags: [],
      additionalNotes: note,
    };
  }
}

/*
 * Convert the selected tags and notes into one string
 * that can still be saved in the existing note column.
 */
function serializeStructuredNote(
  noteState: StructuredNoteState,
): string | null {
  const helpedTags = uniqueTags(
    noteState.helpedTags
      .map((tag) => tag.trim())
      .filter(Boolean),
  );

  const blockedTags = uniqueTags(
    noteState.blockedTags
      .map((tag) => tag.trim())
      .filter(Boolean),
  );

  const additionalNotes =
    noteState.additionalNotes.trim();

  const isEmpty =
    helpedTags.length === 0 &&
    blockedTags.length === 0 &&
    additionalNotes.length === 0;

  if (isEmpty) {
    return null;
  }

  return `${STRUCTURED_NOTE_PREFIX}${JSON.stringify({
    helpedTags,
    blockedTags,
    additionalNotes,
  })}`;
}

function createEmptyStructuredNote(): StructuredNoteState {
  return {
    helpedTags: [],
    blockedTags: [],
    additionalNotes: "",
  };
}

/*
 * Make sure the parsed value is really an array
 * containing valid strings.
 */
function sanitizeTagList(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  const validTags = tags
    .filter(
      (tag): tag is string =>
        typeof tag === "string",
    )
    .map((tag) => tag.trim())
    .filter(Boolean);

  return uniqueTags(validTags);
}

/*
 * Remove duplicate tags while ignoring uppercase/lowercase.
 *
 * Example:
 * ["Busy", "busy"] becomes ["Busy"].
 */
function uniqueTags(tags: string[]): string[] {
  const seenTags = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase();

    if (seenTags.has(normalizedTag)) {
      continue;
    }

    seenTags.add(normalizedTag);
    result.push(tag);
  }

  return result;
}