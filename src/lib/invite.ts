import { z } from "zod";
import type { DatePlan } from "./date-plan";

export type InviteSettings = {
  id: string;
  question_single: string;
  question_free: string;
  yes_label: string;
  no_label_single: string;
  no_label_free: string;
  no_message_single: string;
  no_message_free: string;
  date_title: string;
  confirmation_message: string;
  welcome_title: string;
  welcome_subtitle: string;
  cta_label: string;
  date_selection_enabled: boolean;
  min_date: string;
  max_date: string;
  allow_single_date: boolean;
  allow_date_range: boolean;
  blocked_dates: string[];
  available_windows: { start: string; end: string }[];
  updated_at: string;
};

export type InviteResponse = Partial<DatePlan> & {
  id: string;
  is_single: boolean;
  is_free: boolean;
  selected_date: string | null;
  range_start: string | null;
  range_end: string | null;
  created_at: string;
};

/** "YYYY-MM-DD" for a local Date, avoiding timezone shifts from toISOString(). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse "YYYY-MM-DD" into a local Date at midnight. */
export function fromISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function formatPretty(value: string): string {
  return fromISODate(value).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
  .refine((value) => toISODate(fromISODate(value)) === value, "Invalid date");

export const settingsSchema = z.object({
  question_single: z.string().trim().min(1, "Required").max(200),
  question_free: z.string().trim().min(1, "Required").max(200),
  yes_label: z.string().trim().min(1, "Required").max(60),
  no_label_single: z.string().trim().min(1, "Required").max(60),
  no_label_free: z.string().trim().min(1, "Required").max(60),
  no_message_single: z.string().trim().min(1, "Required").max(300),
  no_message_free: z.string().trim().min(1, "Required").max(300),
  date_title: z.string().trim().min(1, "Required").max(200),
  confirmation_message: z.string().trim().min(1, "Required").max(300),
  welcome_title: z.string().trim().min(1, "Required").max(120),
  welcome_subtitle: z.string().trim().min(1, "Required").max(300),
  cta_label: z.string().trim().min(1, "Required").max(60),
  date_selection_enabled: z.boolean(),
  min_date: isoDateSchema,
  max_date: isoDateSchema,
  allow_single_date: z.boolean(),
  allow_date_range: z.boolean(),
  blocked_dates: z.array(isoDateSchema),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

/** Admin-generated contiguous windows let Firestore rules reject ranges crossing blocked days. */
export function buildAvailableWindows(
  settings: SettingsInput,
): InviteSettings["available_windows"] {
  if (settings.min_date > settings.max_date)
    throw new Error("The minimum date must be before the maximum date.");
  if (
    settings.date_selection_enabled &&
    !settings.allow_single_date &&
    !settings.allow_date_range
  ) {
    throw new Error("Enable at least one date selection mode.");
  }
  const windows: InviteSettings["available_windows"] = [];
  const blocked = [...new Set(settings.blocked_dates)]
    .filter((day) => day >= settings.min_date && day <= settings.max_date)
    .sort();
  let start = settings.min_date;
  for (const day of blocked) {
    if (start < day) {
      const previous = fromISODate(day);
      previous.setDate(previous.getDate() - 1);
      windows.push({ start, end: toISODate(previous) });
    }
    const next = fromISODate(day);
    next.setDate(next.getDate() + 1);
    start = toISODate(next);
  }
  if (start <= settings.max_date) windows.push({ start, end: settings.max_date });
  return windows;
}

export type Selection =
  { kind: "single"; date: string } | { kind: "range"; start: string; end: string };

/** Server-agnostic validation of a chosen date/range against admin settings. */
export function validateSelection(
  selection: Selection | null,
  settings: InviteSettings,
): string | null {
  if (!settings.date_selection_enabled) return "Date selection is closed right now.";
  if (!selection) return "Please pick a date first.";

  const blocked = new Set(settings.blocked_dates);
  const min = settings.min_date;
  const max = settings.max_date;

  const inWindow = (d: string) => d >= min && d <= max;

  if (selection.kind === "single") {
    if (!isoDateSchema.safeParse(selection.date).success) return "That date isn't valid.";
    if (!settings.allow_single_date) return "Single dates aren't allowed — pick a range.";
    if (!inWindow(selection.date)) return "That date isn't available.";
    if (blocked.has(selection.date)) return "That date is blocked. Try another one.";
    return null;
  }

  if (!settings.allow_date_range) return "Date ranges aren't allowed — pick one day.";
  if (
    !isoDateSchema.safeParse(selection.start).success ||
    !isoDateSchema.safeParse(selection.end).success
  )
    return "That range isn't valid.";
  if (selection.start > selection.end) return "The range looks backwards.";
  if (!inWindow(selection.start) || !inWindow(selection.end)) return "That range isn't available.";
  const days = eachDay(fromISODate(selection.start), fromISODate(selection.end));
  if (days.some((d) => blocked.has(toISODate(d))))
    return "Your range includes a blocked day. Try another one.";
  return null;
}
