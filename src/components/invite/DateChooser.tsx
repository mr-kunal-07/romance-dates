import { useState } from "react";
import type { DateRange } from "react-day-picker";
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
import { cn } from "@/lib/utils";

type Mode = "single" | "range";

export function DateChooser({
  settings,
  onConfirm,
}: {
  settings: InviteSettings;
  onConfirm: (selection: Selection) => void;
}) {
  const bothModes = settings.allow_single_date && settings.allow_date_range;
  const [mode, setMode] = useState<Mode>(settings.allow_single_date ? "single" : "range");
  const [single, setSingle] = useState<Date | undefined>();
  const [range, setRange] = useState<DateRange | undefined>();
  const [error, setError] = useState<string | null>(null);

  const min = fromISODate(settings.min_date);
  const max = fromISODate(settings.max_date);
  const blocked = settings.blocked_dates.map(fromISODate);
  const disabled = [{ before: min }, { after: max }, ...blocked];

  const selection: Selection | null =
    mode === "single"
      ? single
        ? { kind: "single", date: toISODate(single) }
        : null
      : range?.from && range?.to
        ? { kind: "range", start: toISODate(range.from), end: toISODate(range.to) }
        : null;

  const label =
    selection?.kind === "single"
      ? formatPretty(selection.date)
      : selection?.kind === "range"
        ? `${formatPretty(selection.start)} → ${formatPretty(selection.end)}`
        : null;

  if (!settings.date_selection_enabled) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-4xl">🥺</p>
        <p className="text-sm text-muted-foreground">
          Date picking isn&apos;t open right now. Check back soon — I&apos;m planning something.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {bothModes && (
        <div className="flex rounded-full bg-muted p-1" role="tablist">
          {(["single", "range"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={cn(
                "min-h-11 flex-1 rounded-full text-sm font-semibold transition-colors",
                mode === m
                  ? "bg-gradient-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {m === "single" ? "One day" : "A few days"}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-center rounded-3xl border border-border bg-card p-2">
        {mode === "single" ? (
          <Calendar
            mode="single"
            selected={single}
            onSelect={(d) => {
              setSingle(d);
              setError(null);
            }}
            disabled={disabled}
            defaultMonth={min}
            startMonth={min}
            endMonth={max}
            className="pointer-events-auto p-2"
          />
        ) : (
          <Calendar
            mode="range"
            selected={range}
            onSelect={(r) => {
              setRange(r);
              setError(null);
            }}
            disabled={disabled}
            excludeDisabled
            defaultMonth={min}
            startMonth={min}
            endMonth={max}
            className="pointer-events-auto p-2"
          />
        )}
      </div>

      {label ? (
        <p className="rounded-2xl bg-blush px-4 py-3 text-center text-sm font-semibold text-blush-foreground">
          {label}
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          {mode === "single" ? "Tap a day that works for you 💫" : "Tap a start and an end day 💫"}
        </p>
      )}

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
          onConfirm(selection!);
        }}
        disabled={!selection}
      >
        That&apos;s the one ❤️
      </HeartButton>
    </div>
  );
}
