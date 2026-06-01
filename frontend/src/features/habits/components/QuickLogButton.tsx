import { useState } from "react";
import { apiClient } from "../../../config/apiClient";
import type { HabitLogStatus } from "../../../shared/types/api.types";
import { Button } from "../../../shared/components/Button";
import { todayString } from "../../../shared/utils/dateUtils";

export type QuickLogButtonProps = {
  habitId: string;
  status: Extract<HabitLogStatus, "done" | "missed">;
  onLogged?: () => void;
};

export function QuickLogButton({ habitId, status, onLogged }: QuickLogButtonProps) {
  const [isLogging, setIsLogging] = useState(false);

  async function handleQuickLog() {
    try {
      setIsLogging(true);

      await apiClient.saveLog(habitId, {
        logDate: todayString(),
        status,
      });
      onLogged?.();
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <Button disabled={isLogging} onClick={handleQuickLog} type="button">
      {status}
    </Button>
  );
}
