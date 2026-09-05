import { readFile } from "node:fs/promises";
import { after, before, beforeEach, test } from "node:test";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { buildAvailableWindows } from "../src/lib/invite.ts";

let environment;
let publicDb;
let adminDb;
const seed = JSON.parse(
  await readFile(new URL("../firebase/invite-settings.json", import.meta.url), "utf8"),
);
const settings = {
  ...seed,
  allow_date_range: true,
  min_date: "2026-09-01",
  max_date: "2026-09-10",
  blocked_dates: ["2026-09-05"],
};
const response = (overrides = {}) => ({
  date_type: "coffee",
  outfit: "blue",
  is_single: true,
  is_free: true,
  selected_date: "2026-09-03",
  range_start: null,
  range_end: null,
  window_index: 0,
  created_at: serverTimestamp(),
  ...overrides,
});
const save = (data) => setDoc(doc(publicDb, "invite_responses", "test-response"), data);

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: "demo-romance-dates",
    firestore: {
      host: "127.0.0.1",
      port: 8085,
      rules: await readFile(new URL("../firestore.rules", import.meta.url), "utf8"),
    },
  });
  publicDb = environment.unauthenticatedContext().firestore();
  adminDb = environment.authenticatedContext("admin-user", { admin: true }).firestore();
});
beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "invite_settings", "default"), {
      ...settings,
      available_windows: buildAvailableWindows(settings),
      updated_at: Timestamp.now(),
    });
  });
});
after(async () => {
  await environment?.cleanup();
});

test("missing or invalid date preferences are rejected", async () => {
  await assertFails(save(response({ date_type: "unknown" })));
  await assertFails(save(response({ outfit: "" })));

  const incomplete = response();
  delete incomplete.outfit;
  await assertFails(save(incomplete));
});

test("public can read the invitation but cannot change settings", async () => {
  await assertSucceeds(getDoc(doc(publicDb, "invite_settings", "default")));
  await assertFails(
    updateDoc(doc(publicDb, "invite_settings", "default"), { welcome_title: "Changed" }),
  );
});
test("admin claim permits settings updates and response reads", async () => {
  await assertSucceeds(
    updateDoc(doc(adminDb, "invite_settings", "default"), { welcome_title: "Hey Sanskruti" }),
  );
  await assertSucceeds(getDocs(collection(adminDb, "invite_responses")));
  const normalDb = environment.authenticatedContext("normal-user").firestore();
  await assertFails(getDocs(collection(normalDb, "invite_responses")));
});
test("valid single and range responses are accepted", async () => {
  await assertSucceeds(save(response()));
  await assertSucceeds(
    setDoc(
      doc(publicDb, "invite_responses", "range"),
      response({
        selected_date: null,
        range_start: "2026-09-06",
        range_end: "2026-09-09",
        window_index: 1,
      }),
    ),
  );
});
test("responses cannot be read, modified or deleted by public clients", async () => {
  await assertSucceeds(save(response()));
  await assertFails(getDoc(doc(publicDb, "invite_responses", "test-response")));
  await assertFails(
    updateDoc(doc(publicDb, "invite_responses", "test-response"), { is_free: false }),
  );
  await assertFails(deleteDoc(doc(publicDb, "invite_responses", "test-response")));
});
test("blocked dates and ranges crossing blocked days are rejected", async () => {
  await assertFails(save(response({ selected_date: "2026-09-05" })));
  await assertFails(
    save(response({ selected_date: null, range_start: "2026-09-04", range_end: "2026-09-06" })),
  );
});
test("out-of-window, reversed, mixed and empty selections are rejected", async () => {
  for (const invalid of [
    { selected_date: "2026-08-31" },
    { selected_date: null },
    { selected_date: null, range_start: "2026-09-04", range_end: "2026-09-02" },
    { range_start: "2026-09-01", range_end: "2026-09-02" },
    { window_index: -1 },
    { window_index: 999 },
  ])
    await assertFails(save(response(invalid)));
});
test("closed invitations and disabled date modes reject submissions", async () => {
  await updateDoc(doc(adminDb, "invite_settings", "default"), { date_selection_enabled: false });
  await assertFails(save(response()));
  await updateDoc(doc(adminDb, "invite_settings", "default"), {
    date_selection_enabled: true,
    allow_single_date: false,
  });
  await assertFails(save(response()));
});
test("forged timestamps, answers, extra fields and role escalation are denied", async () => {
  await assertFails(save(response({ created_at: Timestamp.fromMillis(0) })));
  await assertFails(save(response({ is_single: false })));
  await assertFails(save(response({ admin: true })));
  await assertFails(setDoc(doc(publicDb, "user_roles", "attacker"), { admin: true }));
});
