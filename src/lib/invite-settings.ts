import configuredSettings from "../../firebase/invite-settings.json";
import { buildAvailableWindows, settingsSchema, type InviteSettings } from "./invite";

const settings = settingsSchema.parse(configuredSettings);

// Bundled with the UI: opening the invitation never depends on a database request.
export const inviteSettings: InviteSettings = {
  ...settings,
  id: "default",
  available_windows: buildAvailableWindows(settings),
  updated_at: "",
};
