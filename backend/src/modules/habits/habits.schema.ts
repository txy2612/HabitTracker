// validation
import { z } from "zod";

const habitNameSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.string().min(1, "Habit name is required."),
);

const reminderTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Reminder time must use HH:mm format.");

const reminderScheduleTypeSchema = z.enum(["daily", "weekly", "specific_date"]);

const reminderWeekdaySchema = z
  .number()
  .int("Weekday must be a whole number.")
  .min(0, "Weekday must be between 0 and 6.")
  .max(6, "Weekday must be between 0 and 6.");

const specificDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Specific date must use YYYY-MM-DD format.");

const timezoneSchema = z
  .string()
  .trim()
  .min(1, "Timezone is required.")
  .refine((timezone) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
      return true;
    } catch {
      return false;
    }
  }, "Timezone must be a valid IANA timezone.");

export const habitBodySchema = z.object({
  name: habitNameSchema,
});

const habitIdParamsSchema = z.object({
  id: z.string().min(1, "Habit id is required."),
});

const habitIdRequestSchema = z.object({
  params: habitIdParamsSchema,
});

export const createHabitRequestSchema = z.object({
  body: habitBodySchema,
});

export const updateHabitRequestSchema = createHabitRequestSchema.extend({
  params: habitIdParamsSchema,
});

export const deleteHabitRequestSchema = habitIdRequestSchema;

export const archiveHabitRequestSchema = habitIdRequestSchema;

export const restoreHabitRequestSchema = habitIdRequestSchema;

const habitReminderSchema = z
  .object({
    id: z.string().min(1, "Habit id is required."),
    reminderEnabled: z.boolean(),
    reminderTime: reminderTimeSchema.nullable(),
    scheduleType: reminderScheduleTypeSchema.default("daily"),
    weekdays: z.array(reminderWeekdaySchema).default([]),
    specificDate: specificDateSchema.nullable().default(null),
  })
  .superRefine((reminder, context) => {
    if (reminder.reminderEnabled && reminder.reminderTime === null) {
      context.addIssue({
        code: "custom",
        message: "Reminder time is required when reminder is enabled.",
        path: ["reminderTime"],
      });
    }

    if (!reminder.reminderEnabled) {
      return;
    }

    if (reminder.scheduleType === "daily") {
      if (reminder.weekdays.length > 0) {
        context.addIssue({
          code: "custom",
          message: "Weekdays must be empty for daily reminders.",
          path: ["weekdays"],
        });
      }

      if (reminder.specificDate !== null) {
        context.addIssue({
          code: "custom",
          message: "Specific date must be empty for daily reminders.",
          path: ["specificDate"],
        });
      }
    }

    if (reminder.scheduleType === "weekly") {
      if (reminder.weekdays.length === 0) {
        context.addIssue({
          code: "custom",
          message: "Select at least one weekday for weekly reminders.",
          path: ["weekdays"],
        });
      }

      if (reminder.specificDate !== null) {
        context.addIssue({
          code: "custom",
          message: "Specific date must be empty for weekly reminders.",
          path: ["specificDate"],
        });
      }
    }

    if (reminder.scheduleType === "specific_date") {
      if (reminder.weekdays.length > 0) {
        context.addIssue({
          code: "custom",
          message: "Weekdays must be empty for specific-date reminders.",
          path: ["weekdays"],
        });
      }

      if (reminder.specificDate === null) {
        context.addIssue({
          code: "custom",
          message: "Specific date is required for specific-date reminders.",
          path: ["specificDate"],
        });
      }
    }
  });

export const updateHabitRemindersRequestSchema = z.object({
  body: z
    .object({
      timezone: timezoneSchema,
      reminders: z.array(habitReminderSchema),
    })
    .superRefine((body, context) => {
      const habitIds = new Set<string>();

      body.reminders.forEach((reminder, index) => {
        if (habitIds.has(reminder.id)) {
          context.addIssue({
            code: "custom",
            message: "Each habit can only appear once.",
            path: ["reminders", index, "id"],
          });
        }

        habitIds.add(reminder.id);
      });
    }),
});

export const updateTimezoneRequestSchema = z.object({
  body: z.object({
    timezone: timezoneSchema,
  }),
});

// BlaBlaRequest = type
// BlaBlaSchema = schema 
export type HabitBody = z.infer<typeof habitBodySchema>;
export type CreateHabitRequest = z.infer<typeof createHabitRequestSchema>;
export type UpdateHabitRequest = z.infer<typeof updateHabitRequestSchema>;
export type DeleteHabitRequest = z.infer<typeof deleteHabitRequestSchema>;
export type ArchiveHabitRequest = z.infer<typeof archiveHabitRequestSchema>;
export type RestoreHabitRequest = z.infer<typeof restoreHabitRequestSchema>;
export type UpdateHabitRemindersRequest = z.infer<typeof updateHabitRemindersRequestSchema>;
export type UpdateTimezoneRequest = z.infer<typeof updateTimezoneRequestSchema>;
export type HabitReminderInput = z.infer<typeof habitReminderSchema>;
