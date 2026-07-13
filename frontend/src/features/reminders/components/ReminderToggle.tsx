export type ReminderToggleProps = {
  isEnabled: boolean;
  label: string;
  onToggle: (nextValue: boolean) => void;
};

export function ReminderToggle({ isEnabled, label, onToggle }: ReminderToggleProps) {
  return (
    <button
      aria-checked={isEnabled}
      aria-label={label}
      className={`relative h-10 w-[4.5rem] shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        isEnabled ? "bg-emerald-500" : "bg-slate-300"
      }`}
      onClick={() => onToggle(!isEnabled)}
      role="switch"
      type="button"
    >
      <span
        aria-hidden="true"
        className={`absolute top-1.5 h-7 w-7 rounded-full bg-white shadow-sm transition ${
          isEnabled ? "left-9" : "left-1.5"
        }`}
      />
    </button>
  );
}
