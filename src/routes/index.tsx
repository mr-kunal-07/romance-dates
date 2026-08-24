import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FloatingHearts } from "@/components/invite/FloatingHearts";
import { HeartButton } from "@/components/invite/HeartButton";
import { Modal } from "@/components/invite/Modal";
import { DateChooser } from "@/components/invite/DateChooser";
import { useInviteSettings, useSubmitResponse } from "@/hooks/useInvite";
import { celebrate } from "@/lib/confetti";
import { formatPretty, type Selection } from "@/lib/invite";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Little Question For You 💕" },
      {
        name: "description",
        content:
          "A tiny romantic invitation, just for you. Answer two sweet questions and pick the day you're free.",
      },
      { property: "og:title", content: "A Little Question For You 💕" },
      {
        property: "og:description",
        content: "Two sweet questions and one date to choose. Open it? 👀",
      },
      { name: "twitter:title", content: "A Little Question For You 💕" },
    ],
  }),
  component: InvitePage,
});

type Step = "single" | "free" | "date" | "confirm" | "done";

function InvitePage() {
  const { data: settings, isLoading, isError, error, refetch } = useInviteSettings();
  const submit = useSubmitResponse();

  const [step, setStep] = useState<Step | null>(null);
  const [teaseSingle, setTeaseSingle] = useState(false);
  const [teaseFree, setTeaseFree] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);

  const selectionLabel =
    selection?.kind === "single"
      ? formatPretty(selection.date)
      : selection?.kind === "range"
        ? `${formatPretty(selection.start)} → ${formatPretty(selection.end)}`
        : "";

  async function handleConfirm() {
    try {
      await submit.mutateAsync(selection);
      setStep("done");
      void celebrate();
    } catch {
      /* error surfaced from mutation state below */
    }
  }

  return (
    <main className="bg-romance relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-12">
      <FloatingHearts />

      <section className="relative z-10 w-full max-w-md text-center">
        {isLoading && (
          <div className="card-glass mx-auto animate-pulse space-y-4 rounded-4xl p-10">
            <div className="mx-auto h-6 w-32 rounded-full bg-muted" />
            <div className="mx-auto h-4 w-52 rounded-full bg-muted" />
            <div className="mx-auto h-14 w-44 rounded-full bg-muted" />
          </div>
        )}

        {isError && (
          <div className="card-glass mx-auto space-y-4 rounded-4xl p-8">
            <p className="text-4xl">💔</p>
            <h1 className="text-2xl font-semibold">Couldn&apos;t open the invitation</h1>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
            <HeartButton onClick={() => void refetch()}>Try again</HeartButton>
          </div>
        )}

        {settings && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="card-glass rounded-4xl px-6 py-10 sm:px-10"
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
            <p className="mt-4 text-xs text-muted-foreground">
              made with far too much love 💌
            </p>
          </motion.div>
        )}
      </section>

      {settings && (
        <>
          <Modal
            open={step === "single"}
            stepKey="single"
            title={settings.question_single}
          >
            <div className="space-y-3">
              <HeartButton onClick={() => setStep("free")}>{settings.yes_label}</HeartButton>
              <HeartButton
                variant="no"
                onClick={() => {
                  setTeaseSingle(true);
                  setTeaseFree(false);
                }}
              >
                {settings.no_label_single}
              </HeartButton>
              <Tease show={teaseSingle} message={settings.no_message_single} emoji="😏" />
            </div>
          </Modal>

          <Modal open={step === "free"} stepKey="free" title={settings.question_free}>
            <div className="space-y-3">
              <HeartButton onClick={() => setStep("date")}>{settings.yes_label}</HeartButton>
              <HeartButton variant="no" onClick={() => setTeaseFree(true)}>
                {settings.no_label_free}
              </HeartButton>
              <Tease show={teaseFree} message={settings.no_message_free} emoji="🥺" />
            </div>
          </Modal>

          <Modal open={step === "date"} stepKey="date" title={settings.date_title}>
            <DateChooser
              settings={settings}
              onConfirm={(value) => {
                setSelection(value);
                setStep("confirm");
              }}
            />
          </Modal>

          <Modal open={step === "confirm"} stepKey="confirm" title={settings.confirmation_message}>
            <div className="space-y-5 text-center">
              <span className="animate-heartbeat inline-block text-5xl">💖</span>
              <div className="rounded-3xl bg-blush px-4 py-4">
                <p className="text-xs tracking-widest text-blush-foreground/70 uppercase">
                  You chose
                </p>
                <p className="mt-1 text-base font-semibold text-blush-foreground">
                  {selectionLabel}
                </p>
              </div>
              {submit.isError && (
                <p role="alert" className="text-sm font-semibold text-destructive">
                  {(submit.error as Error).message}
                </p>
              )}
              <HeartButton onClick={() => void handleConfirm()} disabled={submit.isPending}>
                {submit.isPending ? "Saving… 💌" : "Confirm ❤️"}
              </HeartButton>
              <button
                type="button"
                onClick={() => setStep("date")}
                className="min-h-11 w-full text-sm font-semibold text-muted-foreground"
              >
                Pick a different day
              </button>
            </div>
          </Modal>

          <Modal open={step === "done"} stepKey="done">
            <div className="space-y-5 text-center">
              <span className="animate-heartbeat inline-block text-6xl">🥰</span>
              <h2 className="text-3xl font-semibold">It&apos;s official!</h2>
              <p className="text-balance-pretty text-sm text-muted-foreground">
                {selectionLabel} is locked in. I&apos;ll take care of the rest — you just show up
                looking like that.
              </p>
              <p className="text-2xl">💐 🍷 ✨</p>
            </div>
          </Modal>
        </>
      )}
    </main>
  );
}

function Tease({ show, message, emoji }: { show: boolean; message: string; emoji: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="mt-2 flex items-start gap-3 rounded-3xl bg-lilac px-4 py-3 text-left">
            <motion.span
              animate={{ rotate: [0, -12, 12, -8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }}
              className="text-2xl"
            >
              {emoji}
            </motion.span>
            <p className="text-balance-pretty text-sm font-semibold text-lilac-foreground">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
