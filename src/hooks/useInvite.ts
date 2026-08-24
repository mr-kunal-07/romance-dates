import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { InviteResponse, InviteSettings, Selection, SettingsInput } from "@/lib/invite";

export const settingsKey = ["invite-settings"] as const;
export const responsesKey = ["invite-responses"] as const;

export function useInviteSettings() {
  return useQuery({
    queryKey: settingsKey,
    queryFn: async (): Promise<InviteSettings> => {
      const { data, error } = await supabase
        .from("invite_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) throw new Error("The invitation hasn't been set up yet.");
      return data as InviteSettings;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: SettingsInput) => {
      const { error } = await supabase
        .from("invite_settings")
        .update(values)
        .eq("id", "default")
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKey }),
  });
}

export function useResponses() {
  return useQuery({
    queryKey: responsesKey,
    queryFn: async (): Promise<InviteResponse[]> => {
      const { data, error } = await supabase
        .from("invite_responses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as InviteResponse[];
    },
  });
}

export function useSubmitResponse() {
  return useMutation({
    mutationFn: async (selection: Selection | null) => {
      const payload = {
        is_single: true,
        is_free: true,
        selected_date: selection?.kind === "single" ? selection.date : null,
        range_start: selection?.kind === "range" ? selection.start : null,
        range_end: selection?.kind === "range" ? selection.end : null,
      };
      const { error } = await supabase.from("invite_responses").insert(payload);
      if (error) throw new Error(error.message);
    },
  });
}
