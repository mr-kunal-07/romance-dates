import { z } from "zod";

export const dateTypes = [
  {
    value: "coffee",
    label: "Coffee date",
    emoji: "☕",
    description: "Warm coffee, long conversations, just us.",
  },
  {
    value: "dinner",
    label: "Candlelight dinner",
    emoji: "🕯️",
    description: "Soft lights and a little romance.",
  },
  {
    value: "surprise",
    label: "Surprise me",
    emoji: "💌",
    description: "Kunal, plan something sweet for us.",
  },
] as const;
export const outfits = [
  { value: "blue", label: "A little sky blue", emoji: "🩵" },
  { value: "sage", label: "Sweet in sage", emoji: "🌿" },
  { value: "rose", label: "Blushing together", emoji: "🌷" },
  { value: "decide_later", label: "I'll decide later", emoji: "✨" },
] as const;
export const datePlanSchema = z.object({
  date_type: z.enum(["coffee", "dinner", "surprise"]),
  outfit: z.enum(["blue", "sage", "rose", "decide_later"]),
});
export type DatePlan = z.infer<typeof datePlanSchema>;

export function describePlan(plan: DatePlan) {
  return {
    date: dateTypes.find((item) => item.value === plan.date_type)!,
    outfit: outfits.find((item) => item.value === plan.outfit)!,
  };
}

export function makeWhatsAppMessage(plan: DatePlan, dateLabel: string) {
  const details = describePlan(plan);
  return `Hi Kunal, Sanskruti at this Side...\n\nIt's a date! ❤️\n${details.date.label}\n${dateLabel}\nOutfit: ${details.outfit.label}`;
}
