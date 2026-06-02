// useReminders = hook = brain/controller
// RemindersPage = UI 
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../api/apiClient";
import type { Habit, HabitReminderInput } from "../../shared/types/api.types";

/*
useReminders.ts = brain / controller

  1.receives habits
  2.creates editable reminder drafts
  3.stores email, errors, saving state
  4.provides functions to update draft state
  5.saves reminders to backend through apiClient
*/
const DEFAULT_REMINDER_TIME = "09:00";
const REMINDER_EMAIL_STORAGE_KEY = "habitTracker.reminderEmail";

export type ReminderDraft = HabitReminderInput & {
  name: string;
};

export type UseRemindersResult = {
  drafts: ReminderDraft[];
  email: string;
  error: string | null;
  isSaving: boolean;
  savedMessage: string | null;
  timezone: string;
  setEmail: (email: string) => void;
  setReminderEnabled: (habitId: string, isEnabled: boolean) => void;
  setReminderTime: (habitId: string, reminderTime: string) => void;
  saveReminders: () => Promise<Habit[]>;
};

function getLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function getStoredEmail() {
  return window.localStorage.getItem(REMINDER_EMAIL_STORAGE_KEY) ?? "";
}

function createDrafts(habits: Habit[]): ReminderDraft[] {
  return habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    reminderEnabled: habit.reminderEnabled,
    reminderTime: habit.reminderEnabled ? habit.reminderTime ?? DEFAULT_REMINDER_TIME : null,
  }));
}

// state : when they change, React re-renders the page
export function useReminders(habits: Habit[]): UseRemindersResult {

  /*draft state:
      habits = real backend data
      drafts = editable temporary UI data (bcz user may toggle b4    saving, dw to instantly change backend)
  */
  const [drafts, setDrafts] = useState<ReminderDraft[]>(() => createDrafts(habits));
  const [email, setEmail] = useState(getStoredEmail);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  /* useMemo:
      Calculate timezone once.
      Keep the value.
      Don’t recalculate every render.

      [] = run only once during first load
   */
  const timezone = useMemo(getLocalTimezone, []);

  // whenever habits change, re-create the drafts
  useEffect(() => {
    setDrafts(createDrafts(habits));
  }, [habits]);

  function setReminderEnabled(habitId: string, isEnabled: boolean) {
    setSavedMessage(null);
    // React detects changes by comparing OLD w NEW
    // if directly modify OLD, React may not realized changes
    // -> create new object

    // .map() creates mew array, leave old one unchanged
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === habitId
          ? {
              ...draft,
              reminderEnabled: isEnabled,
              // Derived/prepared data
              // If reminder is ON -> use existing time -> no time, use 900
              // If reminder if OFF -> time = null
              /* if true, use value after ? 
                  if false, use value after :
               */
              reminderTime: isEnabled ? draft.reminderTime ?? DEFAULT_REMINDER_TIME : null,
            }
          : draft,
      ),
    );
  }

  function setReminderTime(habitId: string, reminderTime: string) {
    setSavedMessage(null);
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) => (draft.id === habitId ? { ...draft, reminderTime } : draft)),
    );
  }

  async function saveReminders() {
    try {
      setIsSaving(true);
      setError(null);
      setSavedMessage(null);

      const trimmedEmail = email.trim();
      const habits = await apiClient.saveHabitReminders({
        reminderEmail: trimmedEmail === "" ? null : trimmedEmail,
        timezone,
        reminders: drafts.map(({ id, reminderEnabled, reminderTime }) => ({
          id,
          reminderEnabled,
          reminderTime: reminderEnabled ? reminderTime ?? DEFAULT_REMINDER_TIME : null,
        })),
      });

      window.localStorage.setItem(REMINDER_EMAIL_STORAGE_KEY, trimmedEmail);
      setSavedMessage("Reminders saved.");

      return habits;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save reminders.");
      throw saveError;
    } finally {
      setIsSaving(false);
    }
  }

  // return object from hook
  // = expose things UI needs
  return {
    drafts,
    email,
    error,
    isSaving,
    savedMessage,
    timezone,
    setEmail,
    setReminderEnabled,
    setReminderTime,
    saveReminders,
  };
}
