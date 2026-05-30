import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { apiClient } from "./config/apiClient";
import { Badge } from "./shared/components/Badge";
import { Button } from "./shared/components/Button";
import { EmptyState } from "./shared/components/EmptyState";
import { Input } from "./shared/components/Input";
import type { Habit, HabitLog, StreakSummary } from "./shared/types/api.types";
import {
  currentMonthString,
  formatDateRange,
  formatMonth,
  getMonthDays,
  shiftMonth,
  toDateString,
} from "./shared/utils/dateUtils";
import { DashboardPage } from "./features/habits/pages/DashboardPage";

const motivationalQuotes = [
  "Small steps count. Log one today.",
  "Consistency wins quietly.",
  "Keep the promise small and repeatable.",
  "One mark today keeps the chain alive.",
];

const emptyStreak: StreakSummary = {
  currentStreak: 0,
  currentStartDate: null,
  currentEndDate: null,
  highestStreak: 0,
  highestStartDate: null,
  highestEndDate: null,
};

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [streak, setStreak] = useState<StreakSummary>(emptyStreak);
  const [newHabitName, setNewHabitName] = useState("");
  const [currentMonth, setCurrentMonth] = useState(currentMonthString());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const reminderTimerRef = useRef<number | null>(null);

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === selectedHabitId) ?? null,
    [habits, selectedHabitId],
  );

  const logsByDate = useMemo(
    () => new Map(logs.map((log) => [log.logDate, log])),
    [logs],
  );

  const monthDays = useMemo(() => getMonthDays(currentMonth), [currentMonth]);
  const today = toDateString(new Date());

  const loadHabits = useCallback(async () => {
    const data = await apiClient.getHabits();
    setHabits(data);
    setSelectedHabitId((currentId) => {
      if (currentId && data.some((habit) => habit.id === currentId)) {
        return currentId;
      }

      return data[0]?.id ?? null;
    });
  }, []);

  const loadHabitDetails = useCallback(async (habitId: string, month: string) => {
    const [monthlyLogs, streakSummary] = await Promise.all([
      apiClient.getLogs(habitId, month),
      apiClient.getStreak(habitId),
    ]);

    setLogs(monthlyLogs);
    setStreak(streakSummary);
  }, []);

  const refreshSelectedHabit = useCallback(async () => {
    if (!selectedHabitId) {
      setLogs([]);
      setStreak(emptyStreak);
      return;
    }

    await loadHabitDetails(selectedHabitId, currentMonth);
  }, [currentMonth, loadHabitDetails, selectedHabitId]);

  useEffect(() => {
    loadHabits()
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setIsLoading(false));
  }, [loadHabits]);

  useEffect(() => {
    if (!selectedHabitId) {
      setLogs([]);
      setStreak(emptyStreak);
      return;
    }

    loadHabitDetails(selectedHabitId, currentMonth).catch((loadError: Error) =>
      setError(loadError.message),
    );
  }, [currentMonth, loadHabitDetails, selectedHabitId]);

  const createHabit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newHabitName.trim();

    if (!name) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const habit = await apiClient.createHabit(name);
      setHabits((currentHabits) => [habit, ...currentHabits]);
      setSelectedHabitId(habit.id);
      setNewHabitName("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not create habit.");
    } finally {
      setIsSaving(false);
    }
  };

  const logToday = async () => {
    if (!selectedHabitId) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await apiClient.upsertLog(selectedHabitId, { logDate: today, status: "done" });
      await refreshSelectedHabit();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not log habit.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = async (date: string) => {
    if (!selectedHabitId) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (logsByDate.get(date)?.status === "done") {
        await apiClient.deleteLog(selectedHabitId, date);
      } else {
        await apiClient.upsertLog(selectedHabitId, { logDate: date, status: "done" });
      }

      await refreshSelectedHabit();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update that date.");
    } finally {
      setIsSaving(false);
    }
  };

  const scheduleReminder = useCallback(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    if (reminderTimerRef.current) {
      window.clearTimeout(reminderTimerRef.current);
    }

    const now = new Date();
    const nextReminder = new Date();
    nextReminder.setHours(8, 0, 0, 0);

    if (nextReminder <= now) {
      nextReminder.setDate(nextReminder.getDate() + 1);
    }

    reminderTimerRef.current = window.setTimeout(() => {
      const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      new Notification("Habit check-in", { body: quote });
      scheduleReminder();
    }, nextReminder.getTime() - now.getTime());
  }, []);

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      setError("This browser does not support notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";
    setNotificationEnabled(enabled);

    if (enabled) {
      scheduleReminder();
    }
  };

  const todayIsDone = logsByDate.get(today)?.status === "done";

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[320px_1fr] lg:py-8">
        <aside className="grid content-start gap-5">
          <section className="rounded-md bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Habit Tracker</p>
              <h1 className="mt-2 text-3xl font-black text-zinc-950">Streaks that feel good</h1>
            </div>

            <form className="mt-5 grid gap-3" onSubmit={createHabit}>
              <Input
                label="Habit"
                name="habit"
                placeholder="Drink water"
                value={newHabitName}
                onChange={(event) => setNewHabitName(event.target.value)}
              />
              <Button type="submit" disabled={isSaving || !newHabitName.trim()}>
                Add habit
              </Button>
            </form>
          </section>

          <section className="rounded-md bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between px-2 py-2">
              <h2 className="text-sm font-black uppercase tracking-wide text-zinc-600">Habits</h2>
              <Badge tone="success">{habits.length}</Badge>
            </div>

            <div className="grid gap-2">
              {habits.map((habit) => (
                <button
                  className={`rounded-md border p-3 text-left transition ${
                    selectedHabitId === habit.id
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-transparent hover:bg-zinc-100"
                  }`}
                  key={habit.id}
                  onClick={() => setSelectedHabitId(habit.id)}
                  type="button"
                >
                  <span className="block text-sm font-bold text-zinc-950">{habit.name}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="grid content-start gap-6">
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <EmptyState title="Loading habits" />
          ) : selectedHabit ? (
            <>
              <section className="grid gap-4 rounded-md bg-white p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black text-zinc-950">{selectedHabit.name}</h2>
                    {todayIsDone ? <Badge tone="success">Done today</Badge> : <Badge>Open today</Badge>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={logToday} disabled={isSaving || todayIsDone}>
                    Mark done
                  </Button>
                  <Button onClick={enableNotifications} variant="secondary">
                    {notificationEnabled ? "Notifications on" : "Enable 8am"}
                  </Button>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md bg-emerald-700 p-5 text-white shadow-sm">
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-100">Current streak</p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-6xl font-black leading-none">{streak.currentStreak}</span>
                    <span className="pb-2 text-lg font-bold">days</span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-emerald-50">
                    {formatDateRange(streak.currentStartDate, streak.currentEndDate)}
                  </p>
                </div>

                <div className="rounded-md border border-emerald-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Highest streak</p>
                  <div className="mt-4 flex items-end gap-2 text-emerald-700">
                    <span className="text-6xl font-black leading-none">{streak.highestStreak}</span>
                    <span className="pb-2 text-lg font-bold">days</span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-zinc-600">
                    {formatDateRange(streak.highestStartDate, streak.highestEndDate)}
                  </p>
                </div>
              </section>

              <section className="rounded-md bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-zinc-950">{formatMonth(currentMonth)}</h2>
                  <div className="flex gap-2">
                    <Button
                      aria-label="Previous month"
                      onClick={() => setCurrentMonth((month) => shiftMonth(month, -1))}
                      type="button"
                      variant="secondary"
                    >
                      Prev
                    </Button>
                    <Button
                      aria-label="Next month"
                      onClick={() => setCurrentMonth((month) => shiftMonth(month, 1))}
                      type="button"
                      variant="secondary"
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-7 gap-2">
                  {monthDays.map((day) => {
                    const log = logsByDate.get(day.date);
                    const isDone = log?.status === "done";

                    return (
                      <button
                        className={`aspect-square rounded-md border text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                          isDone
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50"
                        }`}
                        disabled={isSaving}
                        key={day.date}
                        onClick={() => toggleDay(day.date)}
                        type="button"
                      >
                        <span className="flex h-full flex-col justify-between p-2">
                          <span className="text-xs font-bold">{day.weekday}</span>
                          <span className="text-lg font-black">{day.dayNumber}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            <EmptyState title="Add your first habit">
              <p>Use the habit field to create a streak and start logging today.</p>
            </EmptyState>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
