import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { HeartButton } from "@/components/invite/HeartButton";
import {
  formatPretty,
  fromISODate,
  toISODate,
  validateSelection,
  type InviteSettings,
  type Selection,
} from "@/lib/invite";

export function DateChooser({
  settings,
  initialSelection,
  onConfirm,
}: {
  settings: InviteSettings;
  initialSelection?: Selection | null;
  onConfirm: (selection: Selection) => void;
}) {
  const [date, setDate] = useState<Date | undefined>(() =>
    initialSelection?.kind === "single" ? fromISODate(initialSelection.date) : undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const min = fromISODate(settings.min_date);
  const max = fromISODate(settings.max_date);
  const today = new Date();
  const initialMonth = today < min ? min : today > max ? max : today;
  const disabled = [{ before: min }, { after: max }, ...settings.blocked_dates.map(fromISODate)];
  const selection: Selection | null = date ? { kind: "single", date: toISODate(date) } : null;

  if (!settings.date_selection_enabled || !settings.allow_single_date) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Date picking isn&apos;t open right now. Check back soon — I&apos;m planning something.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-center rounded-lg border border-border bg-card p-2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(value) => {
            setDate(value);
            setError(null);
          }}
          disabled={disabled}
          defaultMonth={date ?? initialMonth}
          startMonth={min}
          endMonth={max}
          className="pointer-events-auto p-2"
        />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {date ? formatPretty(toISODate(date)) : "Pick a day for our date 💕"}
      </p>
      {error && (
        <p role="alert" className="text-center text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      <HeartButton
        onClick={() => {
          const problem = validateSelection(selection, settings);
          if (problem) {
            setError(problem);
            return;
          }
          if (selection) onConfirm(selection);
        }}
        disabled={!selection}
      >
        That&apos;s the one ❤️
      </HeartButton>
    </div>
  );
}
