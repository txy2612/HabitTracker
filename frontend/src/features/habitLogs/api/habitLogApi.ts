import { apiClient } from "../../../config/apiClient";

// TODO: Keep habit-log API wrappers here if the feature needs them.
export const habitLogApi = {
  getLogs: apiClient.getLogs,
  saveLog: apiClient.saveLog,
  deleteLog: apiClient.deleteLog,
};
