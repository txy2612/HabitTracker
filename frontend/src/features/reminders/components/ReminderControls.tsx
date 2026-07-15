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
      className={`relative h-10 w-[4.5rem] shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] focus-visible:ring-offset-2 ${
        isEnabled ? "bg-[var(--app-accent)]" : "bg-slate-300"
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

export type NotificationPermissionBannerProps = {
  permission: NotificationPermission | "unsupported";
  onEnable: () => Promise<void>;
};

export function NotificationPermissionBanner({ permission, onEnable }: NotificationPermissionBannerProps) {
  if (permission === "unsupported" || permission === "granted") return null;

  return (
    <section className="app-soft-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4">
      <p className="text-sm text-[var(--app-soft-muted)]">Allow browser notifications to receive reminders while this app is open.</p>
      <button className="font-semibold text-[var(--app-accent-strong)]" onClick={() => void onEnable()} type="button">
        Enable notifications
      </button>
    </section>
  );
}
