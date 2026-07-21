export const DEFAULT_TIMEZONE = "Asia/Kuala_Lumpur";

export const PROFILE_TIMEZONES = {
  "Asia/Kuala_Lumpur": "Kuala Lumpur",
  "Asia/Singapore": "Singapore",
  "Asia/Bangkok": "Bangkok",
  "Asia/Jakarta": "Jakarta",
  "Asia/Manila": "Manila",
  "Asia/Tokyo": "Tokyo",
  "Asia/Seoul": "Seoul",
  "Asia/Kolkata": "India",
  "Europe/London": "London",
  "America/New_York": "New York",
  "America/Los_Angeles": "Los Angeles",
  "Australia/Sydney": "Sydney",
  UTC: "UTC",
};

export function getCurrentTimeInTimezone(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hour =
    parts.find((part) => part.type === "hour")?.value ?? "00";

  const minute =
    parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour}:${minute}`;
}