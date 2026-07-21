import { useState } from "react";
import TimezoneSelect, { type ITimezone } from "react-timezone-select";
import { apiClient } from "../../api/apiClient";
import { Button } from "../../shared/components/Button";
import { PROFILE_TIMEZONES } from "../../shared/utils/timezones";

type ProfileTimezoneSettingsProps = {
  timezone: string;
  onTimezoneSaved: (timezone: string) => void;
};

export function ProfileTimezoneSettings({
  timezone,
  onTimezoneSaved,
}: ProfileTimezoneSettingsProps) {
  const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>(timezone);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function handleTimezoneChange(nextTimezone: ITimezone) {
    setSelectedTimezone(nextTimezone);
    setError(null);
    setSavedMessage(null);
  }

  async function handleSave() {
    const timezoneValue =
      typeof selectedTimezone === "string" ? selectedTimezone : selectedTimezone.value;

    try {
      setIsSaving(true);
      setError(null);
      setSavedMessage(null);

      const settings = await apiClient.updateUserTimezone({ timezone: timezoneValue });
      onTimezoneSaved(settings.timezone);
      setSavedMessage(`Timezone saved as ${settings.timezone}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save timezone.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="border-b border-[var(--app-border)] px-4 py-4">
      <label className="text-sm font-semibold text-[var(--app-text)]" htmlFor="profile-timezone">
        Timezone
      </label>
      <div className="mt-2 text-sm text-slate-900">
        <TimezoneSelect
          id="profile-timezone"
          onChange={handleTimezoneChange}
          timezones={PROFILE_TIMEZONES}
          value={selectedTimezone}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--app-muted)]">
        New reminder times use the current time in this timezone.
      </p>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      {savedMessage ? (
        <p
          aria-live="polite"
          className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
          role="status"
        >
          ✓ {savedMessage}
        </p>
      ) : null}
      <Button
        className={`mt-3 h-9 w-full rounded-xl px-4 text-sm ${
          savedMessage ? "bg-emerald-600 hover:bg-emerald-600" : ""
        }`}
        disabled={isSaving || Boolean(savedMessage)}
        onClick={() => void handleSave()}
        type="button"
      >
        {isSaving ? "Saving..." : savedMessage ? "Timezone saved" : "Save timezone"}
      </Button>
    </div>
  );
}
