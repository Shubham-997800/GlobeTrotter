import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { settingsService } from "./settings.service";
import type { SettingsState } from "./settings.types";

const SETTINGS_KEY = ["settings"] as const;

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => settingsService.get(),
    staleTime: 60_000,
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (next: SettingsState) => settingsService.save(next),
    onSuccess: (saved) => {
      queryClient.setQueryData(SETTINGS_KEY, saved);
      toast.success("Settings saved.");
    },
    onError: () => toast.error("Could not save settings. Try again."),
  });
}
