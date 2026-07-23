export const REMINDER_CHANNELS = ['email', 'push'] as const;

export type ReminderChannel = (typeof REMINDER_CHANNELS)[number];
