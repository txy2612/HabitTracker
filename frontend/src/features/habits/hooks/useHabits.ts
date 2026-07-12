import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../api/apiClient";
import type {
  CreateHabitInput,
  Habit,
  UpdateHabitInput,
} from "../../../shared/types/api.types";

/* Purpose of this file:
 - handle logic of the App, but moved to reusable function

 Mini-project: App stores users
 Habit Tracker: useHabits stores habits

 Mini-project: has deleteUser()
 Habit Tracker: useHabits has deleteHabit()

*/

// desc what useHabits() returns
// if someone call useHabits(), they will receive these
export type UseHabitsResult = {
  habits: Habit[];// array of habits
  archivedHabits: Habit[];
  isLoading: boolean;
  isArchivedLoading: boolean;
  error: string | null;
  archivedError: string | null; // add archivedError -> Habits & ArchivedHabits pages X share same error -> if error happens we can know which one 
  fetchHabits: () => Promise<void>; // () = takes no arguments ; Promise<void> = finishes later & returns ntg
  fetchArchivedHabits: () => Promise<void>;
  createHabit: (input: CreateHabitInput) => Promise<void>;
  updateHabit: (habitId: string, input: UpdateHabitInput) => Promise<void>;
  archiveHabit: (habitId: string) => Promise<void>;
  restoreHabit: (habitId: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  moveHabitLocal: (habitId: string, direction: "up" | "down") => void;
};

export function useHabits(): UseHabitsResult {
  // main lines:
  // stores: habits, error msg, loading status
  //useStates = store changing data
  const [habits, setHabits] = useState<Habit[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchivedLoading, setIsArchivedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archivedError, setArchivedError] = useState<string | null>(null);


  // useCallback = keep the function stable btwn renders
  // bcz useEffect() at the bottom uses fetchHabits()
  // w/o useCallback, React may recreate fetchHabits ev render -> infinite loop
  const fetchHabits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // loads habits from backend
      const data = await apiClient.getHabits();
      setHabits(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load habits.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchArchivedHabits = useCallback(async () => {
    try {
      setIsArchivedLoading(true);
      setArchivedError(null);

      const data = await apiClient.getArchivedHabits();
      setArchivedHabits(data);
    } catch (fetchError) {
      setArchivedError(fetchError instanceof Error ? fetchError.message : "Failed to load archived habits.");
    } finally {
      setIsArchivedLoading(false);
    }
  }, []);

  const createHabit = useCallback(async (input: CreateHabitInput) => {
    try {
      setError(null);
      setArchivedError(null);

      // create habit
      const habit = await apiClient.createHabit(input);
      setHabits((currentHabits) => [habit, ...currentHabits]);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create habit.");
      throw createError;
    }
  }, []);

  const updateHabit = useCallback(async (habitId: string, input: UpdateHabitInput) => {
    try {
      setError(null);
      setArchivedError(null);

      // update habit
      const updatedHabit = await apiClient.updateHabit(habitId, input);
      setHabits((currentHabits) =>
        // loop thru habits, if id matches, replace old habit with updated habit
      // otherwise keep it unchanged
        currentHabits.map((habit) => (habit.id === habitId ? updatedHabit : habit)),
      );
      setArchivedHabits((currentArchivedHabits) =>
        currentArchivedHabits.map((habit) => (habit.id === habitId ? updatedHabit : habit)),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update habit.");
      throw updateError;
    }
  }, []);

  const archiveHabit = useCallback(async (habitId: string) => {
    try {
      setError(null);
      setArchivedError(null);

      const archivedHabit = await apiClient.archiveHabit(habitId);
      setHabits((currentHabits) => currentHabits.filter((habit) => habit.id !== habitId));
      setArchivedHabits((currentArchivedHabits) => [archivedHabit, ...currentArchivedHabits]);
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Failed to archive habit.");
      throw archiveError;
    }
  }, []);

  const restoreHabit = useCallback(async (habitId: string) => {
    try {
      setError(null);
      setArchivedError(null);

      const restoredHabit = await apiClient.restoreHabit(habitId);
      setArchivedHabits((currentArchivedHabits) => currentArchivedHabits.filter((habit) => habit.id !== habitId));
      setHabits((currentHabits) => [restoredHabit, ...currentHabits]);
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "Failed to restore habit.");
      throw restoreError;
    }
  }, []);

  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      setError(null);
      setArchivedError(null);

      await apiClient.deleteHabit(habitId);
      setHabits((currentHabits) => currentHabits.filter((habit) => habit.id !== habitId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete habit.");
      throw deleteError;
    }
  }, []);

  // Purpose: reorders habits (move up/down in array)
  const moveHabitLocal = useCallback((habitId: string, direction: "up" | "down") => {
    // TODO: Replace this local-only prototype with persisted ordering when the backend supports it.
    setHabits((currentHabits) => {
      const currentIndex = currentHabits.findIndex((habit) => habit.id === habitId);

      if (currentIndex === -1) {
        return currentHabits;
      }

      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (nextIndex < 0 || nextIndex >= currentHabits.length) {
        return currentHabits;
      }

      const reorderedHabits = [...currentHabits];
      const [habit] = reorderedHabits.splice(currentIndex, 1);
      reorderedHabits.splice(nextIndex, 0, habit);

      return reorderedHabits;
    });
  }, []);

  // when useHabits starts, auto fetch habits once
  // useEffect = run this code after the component/hook starts
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return {
    habits,
    archivedHabits,
    isLoading,
    isArchivedLoading,
    error,
    archivedError,
    fetchHabits,
    fetchArchivedHabits,
    createHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    moveHabitLocal,
  };
}
