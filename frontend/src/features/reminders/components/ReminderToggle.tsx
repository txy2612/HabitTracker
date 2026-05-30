export type ReminderToggleProps = {
  isEnabled: boolean;
  onToggle: (nextValue: boolean) => void;
};

export function ReminderToggle({ isEnabled, onToggle }: ReminderToggleProps) {
  return (
    <button className="reminder-toggle-placeholder" onClick={() => onToggle(!isEnabled)} type="button">
      {/* TODO: Replace with accessible switch UI. */}
      {isEnabled ? "Reminder on" : "Reminder off"}
    </button>
  );
}
