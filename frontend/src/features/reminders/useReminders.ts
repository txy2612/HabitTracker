// useReminders = hook = brain/controller
// RemindersPage = UI 
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../api/apiClient";
import type {
  Habit,
  HabitReminderInput,
  ReminderScheduleType,
  ReminderWeekday,
} from "../../shared/types/api.types";

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
  setScheduleType: (habitId: string, scheduleType: ReminderScheduleType) => void;
  toggleWeekday: (habitId: string, weekday: ReminderWeekday) => void;
  setSpecificDate: (habitId: string, specificDate: string) => void;
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
    reminderTime: habit.reminderTime ?? DEFAULT_REMINDER_TIME,
    scheduleType: habit.reminderScheduleType,
    weekdays: habit.reminderWeekdays,
    specificDate: habit.reminderSpecificDate,
  }));
}

function areWeekdaysEqual(leftWeekdays: ReminderWeekday[], rightWeekdays: ReminderWeekday[]) {
  if (leftWeekdays.length !== rightWeekdays.length) {
    return false;
  }

  return leftWeekdays.every((weekday, index) => weekday === rightWeekdays[index]);
}

function isReminderDraftChanged(currentDraft: ReminderDraft, initialDraft: ReminderDraft | undefined) {
  if (!initialDraft) {
    return true;
  }

  return (
    currentDraft.reminderEnabled !== initialDraft.reminderEnabled ||
    currentDraft.reminderTime !== initialDraft.reminderTime ||
    currentDraft.scheduleType !== initialDraft.scheduleType ||
    currentDraft.specificDate !== initialDraft.specificDate ||
    !areWeekdaysEqual(currentDraft.weekdays, initialDraft.weekdays)
  );
}

// state : when they change, React re-renders the page
export function useReminders(habits: Habit[]): UseRemindersResult {

  /*draft state:
      habits = real backend data
      drafts = editable temporary UI data (bcz user may toggle b4    saving, dw to instantly change backend)
  */
  const [drafts, setDrafts] = useState<ReminderDraft[]>(() => createDrafts(habits));
  const [email, setEmail] = useState(getStoredEmail);
  const [timezone, setTimezone] = useState(getLocalTimezone);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  // iniDrafts = backend ori val; draft = current edited value
  //  Why useMemo()? only update when habits is changed, not on every render
  const initialDrafts = useMemo(() => createDrafts(habits), [habits]);

  // lookup map ( like hashmap, faster instead of looping thru habits)
  const initialDraftsById = useMemo(
    () => new Map(initialDrafts.map((draft) => [draft.id, draft])),
    [initialDrafts],
  );

  /* useMemo:
      Calculate timezone once.
      Keep the value.
      Don’t recalculate every render.

      [] = run only once during first load
   */
  // whenever habits change, re-create the drafts
  useEffect(() => {
    setDrafts(initialDrafts);
  }, [initialDrafts]);

  useEffect(() => {
    let isActive = true;

    async function fetchReminderSettings() {
      try {
        const settings = await apiClient.getHabitReminderSettings();

        if (isActive) {
          const savedEmail = settings.reminderEmail ?? "";
          setEmail(savedEmail);
          setTimezone(settings.timezone || getLocalTimezone());
          window.localStorage.setItem(REMINDER_EMAIL_STORAGE_KEY, savedEmail);
        }
      } catch {
        // Keep local defaults if backend settings cannot load.
      }
    }

    void fetchReminderSettings();

    return () => {
      isActive = false;
    };
  }, []);

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
              reminderTime: draft.reminderTime ?? DEFAULT_REMINDER_TIME,
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

  function setScheduleType(habitId: string, scheduleType: ReminderScheduleType) {
    setSavedMessage(null);
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) => {
        if (draft.id !== habitId) {
          return draft;
        }

        if (scheduleType === "daily") {
          return {
            ...draft,
            scheduleType,
            weekdays: [],
            specificDate: null,
          };
        }

        if (scheduleType === "weekly") {
          return {
            ...draft,
            scheduleType,
            specificDate: null,
          };
        }

        return {
          ...draft,
          scheduleType,
          weekdays: [],
        };
      }),
    );
  }

  function toggleWeekday(habitId: string, weekday: ReminderWeekday) {
    setSavedMessage(null);
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) => {
        if (draft.id !== habitId) {
          return draft;
        }

        const alreadySelected = draft.weekdays.includes(weekday);

        return {
          ...draft,
          weekdays: alreadySelected
            ? draft.weekdays.filter((value) => value !== weekday)
            : [...draft.weekdays, weekday].sort((left, right) => left - right),
        };
      }),
    );
  }

  function setSpecificDate(habitId: string, specificDate: string) {
    setSavedMessage(null);
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === habitId
          ? {
              ...draft,
              specificDate: specificDate === "" ? null : specificDate,
            }
          : draft,
      ),
    );
  }

  async function saveReminders() {
    try {
      setIsSaving(true);
      setError(null);
      setSavedMessage(null);

      const trimmedEmail = email.trim();
      // BUG FIX:
      // filter b4 saving
      // keeps only when isReminderDraftChanged return true
      const changedReminders = drafts.filter((draft) => isReminderDraftChanged(draft, initialDraftsById.get(draft.id)));
      const habits = await apiClient.saveHabitReminders({
        reminderEmail: trimmedEmail === "" ? null : trimmedEmail,
        timezone,
        // send ONLY CHANGED reminders (dont include overdue reminders -> prevent backend error)
        reminders: changedReminders.map(({ id, reminderEnabled, reminderTime, scheduleType, weekdays, specificDate }) => ({
          id,
          reminderEnabled,
          reminderTime: reminderTime ?? DEFAULT_REMINDER_TIME,
          scheduleType,
          weekdays,
          specificDate,
        })),
      });

      window.localStorage.setItem(REMINDER_EMAIL_STORAGE_KEY, trimmedEmail);
      setSavedMessage("Reminder settings saved. Paused reminders kept their saved schedule.");

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
    setScheduleType,
    toggleWeekday,
    setSpecificDate,
    saveReminders,
  };
}
