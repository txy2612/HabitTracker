//baby bowl manager

import { useEffect, useState } from "react";
import { apiClient } from "../../../config/apiClient";// the way to ask kitchen for food
import type { CreateHabitInput, Habit } from "../../../shared/types/api.types";

// create React hook
// ev page that calls useHabits() gets access to baby bowl
export function useHabits() {
    // useState = to update state & UI immediately
  const [habits, setHabits] = useState<Habit[]>([]); //ini empty, later habits gets stored in Habit[]
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // when baby wakes up, needs food -> fill the bowl
  // when screen appears, load the habits
  async function loadHabits() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await apiClient.getHabits();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load habits.");
    } finally {
      setIsLoading(false);
    }
  }

  async function createHabit(input: CreateHabitInput) {
    try {
      setError(null);

      // sends POST /habits to backend, backend creates & return new habit
      const newHabit = await apiClient.createHabit(input.name);

      // sethabits = put food into bowl
      // backend return the habits (kitchen get food ready, passing to baby's bowl)

      // currentHabit = put into bowl, instead of reloading entire bowl
      setHabits((currentHabits) => [newHabit, ...currentHabits]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create habit.");
    }
  }

  // when baby wakes up, ask for food
  useEffect(() => {
    loadHabits();
  }, []);

  return {
    habits,
    isLoading,
    error,
    loadHabits,
    createHabit,
  };
}