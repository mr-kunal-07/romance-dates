import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  doc,
  getDocFromServer,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { z } from "zod";
import { getDb } from "@/integrations/firebase/client";
import { datePlanSchema, type DatePlan } from "@/lib/date-plan";
import {
  buildAvailableWindows,
  settingsSchema,
  validateSelection,
  type InviteResponse,
  type InviteSettings,
  type Selection,
  type SettingsInput,
} from "@/lib/invite";

export const settingsKey = ["invite-settings"] as const;
export const responsesKey = ["invite-responses"] as const;
const storedSettingsSchema = settingsSchema.extend({
  available_windows: z.array(z.object({ start: z.string(), end: z.string() })),
});

function timestampISO(value: unknown): string {
  if (!(value instanceof Timestamp)) throw new Error("Invalid database timestamp.");
  return value.toDate().toISOString();
}

async function fetchSettings(): Promise<InviteSettings> {
  const snapshot = await getDocFromServer(doc(getDb(), "invite_settings", "default"));
  if (!snapshot.exists()) throw new Error("The invitation hasn't been set up yet.");
  const data = snapshot.data();
  return {
    ...storedSettingsSchema.parse(data),
    id: snapshot.id,
    updated_at: timestampISO(data["updated_at"]),
  };
}

export function useInviteSettings() {
  return useQuery({ queryKey: settingsKey, queryFn: fetchSettings });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: SettingsInput) => {
      const settings = settingsSchema.parse(values);
      await updateDoc(doc(getDb(), "invite_settings", "default"), {
        ...settings,
        available_windows: buildAvailableWindows(settings),
        updated_at: serverTimestamp(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKey }),
  });
}

export function useResponses() {
  return useQuery({
    queryKey: responsesKey,
    queryFn: async (): Promise<InviteResponse[]> => {
      const snapshot = await getDocs(
        query(collection(getDb(), "invite_responses"), orderBy("created_at", "desc")),
      );
      return snapshot.docs.map((response) => {
        const data = response.data();
        const plan = datePlanSchema.safeParse(data);
        return {
          id: response.id,
          ...(plan.success ? plan.data : {}),
          is_single: data["is_single"] === true,
          is_free: data["is_free"] === true,
          selected_date: data["selected_date"] as string | null,
          range_start: data["range_start"] as string | null,
          range_end: data["range_end"] as string | null,
          created_at: timestampISO(data["created_at"]),
        };
      });
    },
  });
}

export function useSubmitResponse() {
  return useMutation({
    mutationFn: async ({
      selection,
      plan,
    }: {
      selection: Selection | null;
      plan: DatePlan | null;
    }) => {
      const preferences = datePlanSchema.parse(plan);
      // Re-read availability when saving in case it changed after opening the calendar.
      const settings = await fetchSettings();
      const problem = validateSelection(selection, settings);
      if (problem) throw new Error(problem);
      if (!selection) throw new Error("Please pick a date first.");
      const start = selection.kind === "single" ? selection.date : selection.start;
      const end = selection.kind === "single" ? selection.date : selection.end;
      const windowIndex = settings.available_windows.findIndex(
        (window) => start >= window.start && end <= window.end,
      );
      if (windowIndex < 0)
        throw new Error("Those dates are no longer available. Please choose again.");
      await addDoc(collection(getDb(), "invite_responses"), {
        ...preferences,
        is_single: true,
        is_free: true,
        selected_date: selection.kind === "single" ? selection.date : null,
        range_start: selection.kind === "range" ? selection.start : null,
        range_end: selection.kind === "range" ? selection.end : null,
        window_index: windowIndex,
        created_at: serverTimestamp(),
      });
    },
  });
}
