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

export function useHabitLogs(): UseHabitLogsResult {
  // TODO: Fetch monthly logs and save/delete log entries here.
  return {
    logs: [],
    isLoading: false,
    error: null,
    fetchLogs: async (habitId, month) => {
      void habitId;
      void month;
    },
    saveLog: async (habitId, input) => {
      void habitId;
      void input;
    },
    deleteLog: async (habitId, date) => {
      void habitId;
      void date;
    },
  };
}
