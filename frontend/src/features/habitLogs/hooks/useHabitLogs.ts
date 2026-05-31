import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../config/apiClient";
import type {
  CreateHabitLogInput,
  HabitLog,
  UpdateHabitLogInput,
} from "../../../shared/types/api.types";

export type UseHabitLogsResult = {
  logs: HabitLog[];
  isLoading: boolean;
  error: string | null;
  fetchLogs: (habitId: string, month: string) => Promise<void>;
  saveLog: (habitId: string, input: CreateHabitLogInput | UpdateHabitLogInput) => Promise<void>;
  deleteLog: (habitId: string, date: string) => Promise<void>;
};

export function useHabitLogs(habitId?: string, month?: string): UseHabitLogsResult {
  // stores all loaded logs
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load logs from backend
  // useCallback = more stable functions 
  const fetchLogs = useCallback(async (targetHabitId: string, targetMonth: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // fetch logs
      const data = await apiClient.getLogs(targetHabitId, targetMonth);
      setLogs(data); // setLogs -> now React has the logs
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load logs.");
    } finally {
      // regardless will execute, to prevent show 'Loading...' forvever
      setIsLoading(false);
    }
  }, []);

  const saveLog = useCallback(async (targetHabitId: string, input: CreateHabitLogInput | UpdateHabitLogInput) => {
    try {
      setError(null);

      const savedLog = await apiClient.saveLog(targetHabitId, input);
      setLogs((currentLogs) => {
        // Look through all current logs.
        // Find one with same date as savedLog.
        const existingLog = currentLogs.find((log) => log.logDate === savedLog.logDate);

        // if no log exists 
        // add a brand new log for that date
        if (!existingLog) {
          return [...currentLogs, savedLog];
        }

        // log exists -> currentLogs.map replaces old logs
        // matches backend - ON CONFLICT (habit_id, log_date) DO UPDATE
        return currentLogs.map((log) => (log.id === savedLog.id ? savedLog : log));
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save log.");
      throw saveError;
    }
  }, []);

  const deleteLog = useCallback(async (targetHabitId: string, date: string) => {
    try {
      setError(null);

      // delete log
      // filter(...) remove from frontend state
      await apiClient.deleteLog(targetHabitId, date);
      setLogs((currentLogs) => currentLogs.filter((log) => log.logDate !== date));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete log.");
    }
  }, []);

  // HabitCard created -> has habitId & month? -> load logs auto
  useEffect(() => {
    if (habitId && month) {
      fetchLogs(habitId, month);
    }
  }, [fetchLogs, habitId, month]);

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    saveLog,
    deleteLog,
  };
}
