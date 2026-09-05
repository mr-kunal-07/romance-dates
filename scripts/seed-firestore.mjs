import { readFile } from "node:fs/promises";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { buildAvailableWindows, settingsSchema } from "../src/lib/invite.ts";

// Node 24+. Supply GOOGLE_APPLICATION_CREDENTIALS outside this repository.
const projectId = process.env.GCLOUD_PROJECT || "thesamplebee";
initializeApp({
  projectId,
  ...(process.env.FIRESTORE_EMULATOR_HOST ? {} : { credential: applicationDefault() }),
});
const settings = settingsSchema.parse(
  JSON.parse(await readFile(new URL("../firebase/invite-settings.json", import.meta.url), "utf8")),
);
const reference = getFirestore().doc("invite_settings/default");
const data = {
  ...settings,
  available_windows: buildAvailableWindows(settings),
  updated_at: FieldValue.serverTimestamp(),
};
if (process.argv.includes("--update")) {
  await reference.update(data);
  console.log(`Updated invitation settings in ${projectId}.`);
} else {
  // Creation precondition preserves any existing settings; responses are never touched.
  await reference.create(data);
  console.log(`Created invitation settings in ${projectId}.`);
}
