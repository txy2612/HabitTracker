export type UseRemindersResult = {
  isEnabled: boolean;
  permission: NotificationPermission | "unsupported";
  quote: string;
  enableReminder: () => Promise<void>;
  disableReminder: () => void;
};

export function useReminders(): UseRemindersResult {
  // TODO: Handle browser notification permission, localStorage, and 8am scheduling.
  return {
    isEnabled: false,
    permission: "default",
    quote: "",
    enableReminder: async () => {},
    disableReminder: () => {},
  };
}
