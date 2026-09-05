import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";
import { buildAvailableWindows, settingsSchema, validateSelection } from "../src/lib/invite.ts";
import { datePlanSchema, makeWhatsAppMessage } from "../src/lib/date-plan.ts";

test("incomplete or unsupported preferences cannot be submitted", () => {
  assert.equal(datePlanSchema.safeParse(null).success, false);
  assert.equal(datePlanSchema.safeParse({ date_type: "coffee" }).success, false);
  assert.equal(datePlanSchema.safeParse({ date_type: "coffee", outfit: "unknown" }).success, false);
});

test("WhatsApp draft includes the selected plan and preserves Sanskruti's greeting", () => {
  const plan = datePlanSchema.parse({ date_type: "dinner", outfit: "rose" });
  const message = makeWhatsAppMessage(plan, "Sunday, September 6, 2026");
  const url = new URL("https://wa.me/919920655685?text=" + encodeURIComponent(message));
  assert.equal(url.searchParams.get("text"), message);
  assert.ok(message.startsWith("Hi Kunal, Sanskruti at this Side..."));
  assert.match(message, /Candlelight dinner/);
  assert.match(message, /Blushing together/);
  assert.doesNotMatch(message, /Color:/);
  assert.match(message, /Sunday, September 6, 2026/);
});

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

test("availability windows exclude blocked days and separate ranges", () => {
  assert.deepEqual(buildAvailableWindows(settings), [
    { start: "2026-09-01", end: "2026-09-04" },
    { start: "2026-09-06", end: "2026-09-10" },
  ]);
});
test("duplicate, consecutive, boundary and out-of-window blocks are handled", () => {
  assert.deepEqual(
    buildAvailableWindows({
      ...settings,
      blocked_dates: ["2026-09-10", "2026-09-01", "2026-09-02", "2026-09-02", "2026-08-01"],
    }),
    [{ start: "2026-09-03", end: "2026-09-09" }],
  );
});
test("fully blocked window has no availability", () => {
  assert.deepEqual(
    buildAvailableWindows({ ...settings, min_date: "2026-09-05", max_date: "2026-09-05" }),
    [],
  );
});
test("invalid configuration is rejected", () => {
  assert.throws(() => buildAvailableWindows({ ...settings, min_date: "2026-10-01" }));
  assert.throws(() =>
    buildAvailableWindows({ ...settings, allow_single_date: false, allow_date_range: false }),
  );
  assert.equal(settingsSchema.safeParse({ ...settings, min_date: "2026-02-30" }).success, false);
});
test("a range cannot bridge a blocked day", () => {
  assert.match(
    validateSelection({ kind: "range", start: "2026-09-04", end: "2026-09-06" }, settings),
    /blocked/,
  );
  assert.equal(
    validateSelection({ kind: "range", start: "2026-09-06", end: "2026-09-10" }, settings),
    null,
  );
});
test("selection respects closed dates, modes, bounds and real calendar dates", () => {
  const choice = { kind: "single", date: "2026-09-03" };
  assert.equal(validateSelection(choice, settings), null);
  assert.match(validateSelection(choice, { ...settings, date_selection_enabled: false }), /closed/);
  assert.match(
    validateSelection(choice, { ...settings, allow_single_date: false }),
    /aren't allowed/,
  );
  assert.match(validateSelection({ ...choice, date: "2026-08-31" }, settings), /available/);
  assert.match(validateSelection({ ...choice, date: "2026-02-30" }, settings), /valid/);
});
