import type { HabitLogStatus } from "../../../shared/types/api.types";
import { Button } from "../../../shared/components/Button";

export type QuickLogButtonProps = {
  habitId: string;
  status: Extract<HabitLogStatus, "done" | "missed">;
  onLogged?: () => void;
};

export function QuickLogButton({ habitId, status, onLogged }: QuickLogButtonProps) {
  void habitId;
  void status;
  void onLogged;

  return (
    <Button type="button">
      {/* TODO: Call apiClient.saveLog with today's date. */}
      {status}
    </Button>
  );
}
