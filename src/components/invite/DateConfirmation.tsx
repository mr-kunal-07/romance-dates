import { CalendarHeart, Heart } from "lucide-react";

import { formatPretty, fromISODate, type Selection } from "@/lib/invite";
import { makeWhatsAppMessage, type DatePlan } from "@/lib/date-plan";
import { PlanSummary } from "./DatePreferences";

export function DateConfirmation({
  selection,
  plan,
}: {
  selection: Selection | null;
  plan: DatePlan;
}) {
  if (!selection) return null;
  const chosenDate = selection.kind === "single" ? selection.date : selection.start;
  const date = fromISODate(chosenDate);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });

  return (
    <div className="relative overflow-hidden text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative">
        <p className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.3em] text-primary">
          <span className="h-px w-8 bg-primary/30" /> YOU + ME{" "}
          <span className="h-px w-8 bg-primary/30" />
        </p>
        <div
          className="relative mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-white to-blush shadow-soft"
          aria-hidden
        >
          <Heart className="h-10 w-10 fill-primary text-primary" strokeWidth={1.2} />
          <Heart
            className="absolute -right-1 top-1 h-5 w-5 -rotate-12 fill-primary/50 text-primary/50"
            strokeWidth={1}
          />
          <span className="absolute -left-3 bottom-2 text-lg text-primary/60">✧</span>
        </div>
        <h2 className="mt-5 text-3xl leading-tight font-semibold text-foreground sm:text-4xl">
          Sanskruti,
          <br />
          <span className="text-primary italic">it&apos;s a date.</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A little time. A lot of butterflies.
          <br />A day I already can&apos;t wait for.
        </p>

        <div className="mt-6 flex items-center gap-4 rounded-lg border border-primary/15 bg-white/65 p-4 text-left">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-blush text-blush-foreground">
            <span className="text-[10px] font-bold tracking-widest uppercase">
              {month.slice(0, 3)}
            </span>
            <span className="font-display text-3xl leading-none font-semibold">
              {date.getDate()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] text-primary">
              <CalendarHeart className="h-3.5 w-3.5" /> OUR DATE
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-foreground">{weekday}</p>
            <p className="text-xs text-muted-foreground">
              {month} {date.getDate()}, {date.getFullYear()}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <PlanSummary plan={plan} />
        </div>
        <p className="mt-5 text-sm leading-relaxed text-foreground/80">
          I&apos;ll take care of the little details.
          <br />
          You just bring that smile I adore.
        </p>
        <div className="mt-6">
          <a
            href={
              "https://wa.me/919920655685?text=" +
              encodeURIComponent(makeWhatsAppMessage(plan, formatPretty(chosenDate)))
            }
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-primary shadow-soft inline-flex min-h-14 w-full items-center justify-center rounded-lg px-6 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            OK ❤️
          </a>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Until then, consider this a little love note. 💌
        </p>
      </div>
    </div>
  );
}
