import { useMutation } from "@tanstack/react-query";
import type { DatePlan } from "@/lib/date-plan";
import type { Selection } from "@/lib/invite";

export function useSubmitResponse() {
  return useMutation({
    mutationFn: async (input: { selection: Selection | null; plan: DatePlan | null }) => {
      const { saveResponse } = await import("./useInvite");
      await saveResponse(input);
    },
  });
}
