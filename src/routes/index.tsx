import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { FloatingHearts } from "@/components/invite/FloatingHearts";
import { HeartButton } from "@/components/invite/HeartButton";
import { DodgingNoButton } from "@/components/invite/DodgingNoButton";
import { Modal } from "@/components/invite/Modal";
import { DateChooser } from "@/components/invite/DateChooser";
import { DateConfirmation } from "@/components/invite/DateConfirmation";
import { DateTypeChooser, PlanSummary } from "@/components/invite/DatePreferences";
import { OutfitChooser } from "@/components/invite/OutfitChooser";
import { BackgroundMusic } from "@/components/invite/BackgroundMusic";
import type { DatePlan } from "@/lib/date-plan";
import { useSubmitResponse } from "@/hooks/useInvite";
import { inviteSettings } from "@/lib/invite-settings";
import { celebrate } from "@/lib/confetti";
import { formatPretty, type Selection } from "@/lib/invite";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Little Question For You 💕" },
      {
        name: "description",
        content:
          "A tiny romantic invitation for Sanskruti. Answer a sweet question and pick a date.",
      },
      { property: "og:title", content: "A Little Question For You 💕" },
      {
        property: "og:description",
        content: "One sweet question and a date to choose. Open it? 👀",
      },
      { name: "twitter:title", content: "A Little Question For You 💕" },
    ],
  }),
  component: InvitePage,
});

type Step = "single" | "date-type" | "outfit" | "date" | "confirm" | "done";

function InvitePage() {
  const settings = inviteSettings;
  const submit = useSubmitResponse();

  const [step, setStep] = useState<Step | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [dateType, setDateType] = useState<DatePlan["date_type"] | null>(null);
  const [outfit, setOutfit] = useState<DatePlan["outfit"] | null>(null);
  const plan: DatePlan | null = dateType && outfit ? { date_type: dateType, outfit } : null;

  const selectionLabel =
    selection?.kind === "single"
      ? formatPretty(selection.date)
      : selection?.kind === "range"
        ? `${formatPretty(selection.start)} → ${formatPretty(selection.end)}`
        : "";

  async function handleConfirm() {
    try {
      await submit.mutateAsync({ selection, plan });
      setStep("done");
      void celebrate();
    } catch {
      /* error surfaced from mutation state below */
    }
  }

  return (
    <main className="bg-romance relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-12">
      <FloatingHearts />
      <BackgroundMusic />

      <section className="relative z-10 w-full max-w-md text-center">
        {settings && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="card-glass rounded-lg px-6 py-10 sm:px-10"
          >
            <span className="animate-heartbeat inline-block text-5xl">❤️</span>
            <h1 className="text-balance-pretty mt-5 text-4xl leading-tight font-semibold sm:text-5xl">
              {settings.welcome_title}
            </h1>
            <p className="text-balance-pretty mt-4 text-base text-muted-foreground">
              {settings.welcome_subtitle}
            </p>
            <div className="mt-8">
              <HeartButton onClick={() => setStep("single")}>{settings.cta_label}</HeartButton>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">made with far too much love 💌</p>
          </motion.div>
        )}
      </section>

      {settings && (
        <>
          <Modal open={step === "single"} stepKey="single" title={settings.question_single}>
            <div className="space-y-3">
              <div data-invite-yes>
                <HeartButton onClick={() => setStep("date-type")}>{settings.yes_label}</HeartButton>
              </div>
              {step === "single" && <DodgingNoButton>{settings.no_label_single}</DodgingNoButton>}
            </div>
          </Modal>

          <Modal
            open={step === "date-type"}
            stepKey="date-type"
            title="What kind of date, Sanskruti? 💕"
          >
            <DateTypeChooser
              value={dateType}
              onChange={setDateType}
              onNext={() => setStep("outfit")}
            />
          </Modal>

          <Modal open={step === "outfit"} stepKey="outfit" title="What shall we wear? ✨">
            <OutfitChooser
              outfit={outfit}
              onOutfitChange={setOutfit}
              onBack={() => setStep("date-type")}
              onNext={() => setStep("date")}
            />
          </Modal>

          <Modal open={step === "date"} stepKey="date" title={settings.date_title}>
            <DateChooser
              settings={settings}
              initialSelection={selection}
              onConfirm={(value) => {
                setSelection(value);
                setStep("confirm");
              }}
            />
            <button
              type="button"
              onClick={() => setStep("outfit")}
              className="mt-3 min-h-11 w-full text-sm font-semibold text-muted-foreground"
            >
              Back to outfits
            </button>
          </Modal>

          <Modal open={step === "confirm"} stepKey="confirm" title={settings.confirmation_message}>
            <div className="space-y-5 text-center">
              <span className="animate-heartbeat inline-block text-5xl">💖</span>
              <div className="rounded-lg bg-blush px-4 py-4">
                <p className="text-xs tracking-widest text-blush-foreground/70 uppercase">
                  You chose
                </p>
                <p className="mt-1 text-base font-semibold text-blush-foreground">
                  {selectionLabel}
                </p>
              </div>
              {plan && <PlanSummary plan={plan} />}
              {submit.isError && (
                <p role="alert" className="text-sm font-semibold text-destructive">
                  {(submit.error as Error).message}
                </p>
              )}
              <HeartButton
                onClick={() => void handleConfirm()}
                disabled={submit.isPending || !plan}
              >
                {submit.isPending ? "Saving… 💌" : "Confirm ❤️"}
              </HeartButton>
              <button
                type="button"
                disabled={submit.isPending}
                onClick={() => setStep("date")}
                className="min-h-11 w-full text-sm font-semibold text-muted-foreground"
              >
                Pick a different day
              </button>
              <button
                type="button"
                disabled={submit.isPending}
                onClick={() => setStep("date-type")}
                className="min-h-11 w-full text-sm font-semibold text-muted-foreground"
              >
                Change our date idea or outfit
              </button>
            </div>
          </Modal>

          <Modal open={step === "done"} stepKey="done">
            {plan && <DateConfirmation selection={selection} plan={plan} />}
          </Modal>
        </>
      )}
    </main>
  );
}
