// validation
import { z } from "zod";

const habitNameSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.string().min(1, "Habit name is required."),
);

const reminderTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Reminder time must use HH:mm format.");

const reminderEmailSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().email("Reminder email must be a valid email address.").nullable().optional(),
);

const timezoneSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.string().min(1, "Timezone is required."),
);

export const habitBodySchema = z.object({
  name: habitNameSchema,
});

export const createHabitRequestSchema = z.object({
  body: habitBodySchema,
});

export const updateHabitRequestSchema = createHabitRequestSchema.extend({
  params: z.object({
    id: z.string().min(1, "Habit id is required."),
  }),
});

export const deleteHabitRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Habit id is required."),
  }),
});

const habitReminderSchema = z
  .object({
    id: z.string().min(1, "Habit id is required."),
    reminderEnabled: z.boolean(),
    reminderTime: reminderTimeSchema.nullable(),
  })
  .superRefine((reminder, context) => {
    if (reminder.reminderEnabled && reminder.reminderTime === null) {
      context.addIssue({
        code: "custom",
        message: "Reminder time is required when reminder is enabled.",
        path: ["reminderTime"],
      });
    }
  });

export const updateHabitRemindersRequestSchema = z.object({
  body: z
    .object({
      reminderEmail: reminderEmailSchema,
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

// BlaBlaRequest = type
// BlaBlaSchema = schema 
export type HabitBody = z.infer<typeof habitBodySchema>;
export type CreateHabitRequest = z.infer<typeof createHabitRequestSchema>;
export type UpdateHabitRequest = z.infer<typeof updateHabitRequestSchema>;
export type DeleteHabitRequest = z.infer<typeof deleteHabitRequestSchema>;
export type UpdateHabitRemindersRequest = z.infer<typeof updateHabitRemindersRequestSchema>;
export type HabitReminderInput = z.infer<typeof habitReminderSchema>;
