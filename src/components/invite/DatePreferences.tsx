import { HeartButton } from "./HeartButton";
import { dateTypes, describePlan, type DatePlan } from "@/lib/date-plan";

const optionClass =
  "flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-white/60 p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-blush has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary";

export function DateTypeChooser({
  value,
  onChange,
  onNext,
}: {
  value: DatePlan["date_type"] | null;
  onChange: (value: DatePlan["date_type"]) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-muted-foreground">
        Pick your kind of romance. I&apos;ll take care of the rest. 💕
      </p>
      <fieldset className="space-y-3">
        <legend className="sr-only">Choose the kind of date</legend>
        {dateTypes.map((option) => (
          <label key={option.value} className={optionClass}>
            <input
              className="sr-only"
              type="radio"
              name="date-type"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span
              aria-hidden
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blush text-2xl"
            >
              {option.emoji}
            </span>
            <span className="flex-1">
              <span className="block font-semibold">{option.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {option.description}
              </span>
            </span>
            <span
              aria-hidden
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${value === option.value ? "border-primary bg-primary text-white" : "border-border"}`}
            >
              {value === option.value ? "✓" : ""}
            </span>
          </label>
        ))}
      </fieldset>
      <HeartButton disabled={!value} onClick={onNext}>
        Let&apos;s dress for it ❤️
      </HeartButton>
    </div>
  );
}

export function PlanSummary({ plan }: { plan: DatePlan }) {
  const details = describePlan(plan);
  return (
    <div className="rounded-lg border border-primary/15 bg-blush/60 p-3 text-left text-sm">
      <p className="font-semibold text-blush-foreground">
        {details.date.emoji} {details.date.label}
      </p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-muted-foreground">Outfit</dt>
        <dd className="font-semibold">{details.outfit.label}</dd>
      </dl>
    </div>
  );
}
