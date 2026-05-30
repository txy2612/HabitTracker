import { apiClient } from "../../../config/apiClient";
import type {
  HabitLog,
  CreateHabitLogInput,
} from "../types/habitLog.types";

export const habitLogApi = {
  getLogs: (habitId: string, month: string): Promise<HabitLog[]> =>
    apiClient.getLogs(habitId, month),

  saveLog: (
    habitId: string,
    input: CreateHabitLogInput 
  ): Promise<HabitLog> =>
    apiClient.upsertLog(habitId, input),

  deleteLog: (habitId: string, date: string): Promise<void> =>
    apiClient.deleteLog(habitId, date),
};
