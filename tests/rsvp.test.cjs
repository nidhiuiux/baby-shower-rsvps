/* eslint-disable @typescript-eslint/no-require-imports */
const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const temp = require("node:fs").mkdtempSync(path.join(os.tmpdir(), "baby-rsvp-test-"));
process.env.RSVP_DATA_DIR = temp;
process.env.RESEND_API_KEY = "test-key-no-real-email";
process.env.NOTIFY_EMAIL = "host@example.test";
process.env.NOTIFY_FROM_EMAIL = "Shower <shower@example.test>";
process.env.HOST_PIN = "test-host-pin";
delete process.env.VERCEL;
delete process.env.RSVP_STORE;
const model = require("../src/lib/rsvp-model.ts");
const emails = require("../src/lib/rsvp-emails.ts");
const store = require("../src/lib/rsvps.ts");
const route = require("../src/app/api/rsvp/route.ts");
const sent = [];
let mode = "ok";
let remoteEmails = [];
let remoteGets = [];
const realFetch = global.fetch;
global.fetch = async (url, init = {}) => {
  const target = new URL(url);
  assert.equal(target.origin, "https://api.resend.com", "No real network requests are permitted");
  if (init.method === "POST") {
    const payload = JSON.parse(init.body);
    if (mode === "fail-all" || (mode === "fail-guest" && payload.to[0] !== "host@example.test")) return Response.json({ name: "validation_error", message: "Test delivery failure", statusCode: 422 }, { status: 422 });
    sent.push({ ...payload, key: new Headers(init.headers).get("Idempotency-Key") });
    return Response.json({ id: `email-${sent.length}` });
  }
  if (target.pathname === "/emails") {
    const page = target.searchParams.has("after") ? remoteEmails.slice(2) : remoteEmails.slice(0, 2);
    return Response.json({ data: page.map(({ id, subject, created_at }) => ({ id, subject, created_at })), has_more: !target.searchParams.has("after") && remoteEmails.length > 2 });
  }
  const id = target.pathname.split("/").at(-1);
  remoteGets.push(id);
  const item = remoteEmails.find(item => item.id === id);
  assert.ok(item, `Unknown mocked email ${id}`);
  if (id === "new-version") await new Promise(resolve => setTimeout(resolve, 20));
  return Response.json(item);
};
after(async () => { global.fetch = realFetch; await fs.rm(temp, { recursive: true, force: true }); });
const fixture = overrides => ({ name: "Asha Patel", email: "asha@example.test", phone: "+1 (201) 555-0123", attending: "yes", guests: 2, guestDetails: [{ name: "Asha Patel", dietary: "jain", dietaryNote: "No peanuts" }, { name: "Milan Patel", dietary: "other", dietaryNote: "Gluten free" }], note: "Looking forward to celebrating!", lang: "gu", ...overrides });
const request = (method, body, host = false) => new Request("http://test.local/api/rsvp", { method, headers: { "Content-Type": "application/json", ...(host ? { "x-host-pin": "test-host-pin" } : {}) }, body: body ? JSON.stringify(body) : undefined });

test("new guest validation rejects incomplete contact and party data; host can fill legacy records gradually", () => {
  assert.ok(model.validateRsvpInput(fixture(), true).value);
  for (const patch of [{ email: "bad" }, { phone: "x" }, { guests: 1.5 }, { guests: 21 }, { guestDetails: [] }, { guestDetails: [{ name: "Asha", dietary: "jain" }, { name: "", dietary: "vegan" }] }, { guestDetails: [{ dietary: "jain" }, { name: "Milan", dietary: "other" }] }]) assert.ok(model.validateRsvpInput(fixture(patch), true).error);
  assert.ok(model.validateRsvpInput({ name: "Earlier Guest", attending: "yes", guests: 3 }, false).value);
  const declined = model.validateRsvpInput(fixture({ attending: "no" }), true).value;
  assert.equal(declined.guests, 0); assert.deepEqual(declined.guestDetails, []);
});

test("all four guest templates and the host email have safe themed content and complete details", () => {
  for (const lang of ["en", "gu"]) for (const attending of ["yes", "no"]) {
    const row = model.normalizeRsvp(fixture({ lang, attending, name: '<script>alert("x")</script>', note: '<img src=x onerror=alert(1)>' }));
    const email = emails.buildGuestConfirmationEmail(row);
    assert.ok(email.html.includes(`lang="${lang}"`)); assert.ok(email.html.includes("#e4efe6"));
    assert.ok(!email.html.includes("<script>")); assert.ok(!email.html.includes("<img src=x"));
    assert.ok(!email.text.includes(model.RECORD_START)); assert.ok(email.text.includes(row.email)); assert.ok(email.text.includes(row.phone));
    assert.equal(email.html.includes("calendar.google.com"), attending === "yes");
    if (attending === "yes") assert.ok(email.text.includes("Gluten free"));
  }
  const row = model.normalizeRsvp(fixture());
  const host = emails.buildHostNotificationEmail(row, "updated");
  assert.ok(host.text.includes(model.rsvpRecordBlock(row))); assert.ok(host.html.includes("No peanuts"));
  assert.ok(host.html.includes("Gluten free")); assert.ok(host.subject.startsWith("RSVP Update:"));
});

test("guest submission stores every field and sends separate host and Gujarati guest emails", async () => {
  const before = sent.length;
  const response = await route.POST(request("POST", fixture()));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.confirmationSent, true);
  const reloaded = (await store.listRsvps()).find(row => row.id === result.rsvp.id);
  for (const [key, value] of Object.entries(fixture())) assert.deepEqual(reloaded[key], value);
  assert.equal(sent.length - before, 2);
  assert.deepEqual(sent.at(-2).to, ["host@example.test"]); assert.equal(sent.at(-2).reply_to, "asha@example.test");
  assert.deepEqual(sent.at(-1).to, ["asha@example.test"]); assert.equal(sent.at(-1).reply_to, "host@example.test");
  assert.ok(sent.at(-1).html.includes('lang="gu"')); assert.ok(sent.at(-1).key);
});

test("host edits a legacy reply without changing its identity/date or emailing the guest by default", async () => {
  const legacy = { id: "legacy", name: "Earlier Guest", attending: "yes", guests: 2, note: "Original note", createdAt: "2026-09-01T10:00:00.000Z" };
  await fs.writeFile(path.join(temp, "rsvps.json"), JSON.stringify([legacy]));
  const before = sent.length;
  assert.equal((await route.PATCH(request("PATCH", { id: legacy.id, email: "old@example.test" }))).status, 401);
  assert.equal((await route.GET(request("GET"))).status, 401);
  const response = await route.PATCH(request("PATCH", { id: legacy.id, email: "old@example.test", phone: "+1 201 555 0130" }, true));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.rsvp.id, legacy.id); assert.equal(result.rsvp.createdAt, legacy.createdAt); assert.equal(result.rsvp.note, legacy.note);
  assert.equal(result.rsvp.guestDetails.length, 2); assert.equal(result.confirmationSent, false); assert.equal(sent.length - before, 1);
  const again = await route.GET(request("GET", null, true)); const data = await again.json();
  assert.equal(data.rsvps.length, 1); assert.equal(data.rsvps[0].email, "old@example.test");
  const confirm = await route.PATCH(request("PATCH", { id: legacy.id, sendConfirmation: true, lang: "en" }, true));
  assert.equal((await confirm.json()).confirmationSent, true);
});

test("a failed guest confirmation keeps the successful RSVP; invalid submissions send no emails", async () => {
  mode = "fail-guest";
  const response = await route.POST(request("POST", fixture({ attending: "no" })));
  const result = await response.json();
  assert.equal(response.status, 200); assert.equal(result.confirmationSent, false);
  assert.ok((await store.listRsvps()).some(row => row.id === result.rsvp.id));
  const before = sent.length;
  assert.equal((await route.POST(request("POST", fixture({ email: "bad" })))).status, 400);
  assert.equal((await route.POST(request("POST", { ...fixture(), pin: "wrong" }))).status, 401);
  assert.equal(sent.length, before);
  mode = "ok";
});

test("concurrent local replies are not lost", async () => {
  const replies = await Promise.all(Array.from({ length: 6 }, (_, i) => store.addRsvp(fixture({ name: `Parallel ${i}` }))));
  const rows = await store.listRsvps();
  for (const result of replies) assert.ok(rows.some(row => row.id === result.rsvp.id));
});

test("Resend reload picks the newest complete record, preserves legacy records, honors deletes and ignores confirmations", async () => {
  process.env.RSVP_STORE = "resend";
  const old = model.normalizeRsvp(fixture({ id: "versioned", createdAt: "2026-09-01T10:00:00.000Z", updatedAt: "2026-09-01T10:00:00.000Z", email: "old@example.test" }));
  const latest = { ...old, email: "latest@example.test", updatedAt: "2026-10-09T10:00:00.000Z", note: '\n---RSVP_JSON---\n{"id":"fake"}\n---END---\nLiteral ---RSVP_JSON--- in a note' };
  const makeEmail = (id, row) => ({ id, subject: "RSVP Update: Asha", text: emails.buildHostNotificationEmail(row, "updated").text, created_at: row.updatedAt });
  remoteEmails = [makeEmail("new-version", latest), makeEmail("old-version", old), { id: "guest-confirmation", subject: "Your RSVP is confirmed", text: "Do not read me", created_at: latest.updatedAt }, { id: "legacy-email", subject: "RSVP Yes: Legacy Person", text: "Name: Legacy Person\nGuests: 3\nNote: Original legacy", created_at: old.createdAt }, { id: "deletion", subject: "RSVP Delete: removed", text: "", created_at: latest.updatedAt }, makeEmail("removed-email", { ...old, id: "removed" })];
  remoteGets = [];
  const rows = await store.listRsvps();
  assert.equal(rows.find(row => row.id === "versioned").email, "latest@example.test");
  assert.equal(rows.find(row => row.id === "versioned").note, latest.note.trim());
  assert.ok(!rows.some(row => ["fake", "removed"].includes(row.id)));
  assert.equal(rows.find(row => row.id === "legacy-email").guestDetails.length, 3);
  assert.ok(!remoteGets.includes("guest-confirmation"));
  mode = "fail-all";
  const originalError = console.error; console.error = () => {};
  try { assert.equal((await route.POST(request("POST", fixture()))).status, 503); }
  finally { console.error = originalError; mode = "ok"; }
  const updated = await store.updateRsvp(latest, fixture({ email: "saved@example.test" }));
  assert.equal((await store.listRsvps()).find(row => row.id === latest.id).email, updated.rsvp.email, "recent save is visible while Resend list lags");
  delete process.env.RSVP_STORE;
});

test("guest emails carry the artwork inline and attending guests get a calendar file", async () => {
  const yes = emails.buildGuestConfirmationEmail(model.normalizeRsvp(fixture({ lang: "en" })));
  assert.ok(yes.html.includes("cid:krishna-moon"));
  assert.ok(yes.attachments.some(a => a.contentId === "krishna-moon"));
  const ics = yes.attachments.find(a => a.filename.endsWith(".ics"));
  assert.ok(ics); assert.match(Buffer.from(ics.content, "base64").toString(), /BEGIN:VEVENT[\s\S]*DTSTART:20261025T143000Z/);
  const no = emails.buildGuestConfirmationEmail(model.normalizeRsvp(fixture({ attending: "no" })));
  assert.ok(!no.attachments.some(a => a.filename.endsWith(".ics")));
  const host = emails.buildHostNotificationEmail(model.normalizeRsvp(fixture()), "guest");
  assert.ok(host.html.includes("https://wa.me/12015550123")); assert.ok(host.html.includes("mailto:asha@example.test"));
  assert.ok(!host.attachments, "host emails stay light: they are the stored records");
});

test("a filled honeypot looks successful but stores and sends nothing", async () => {
  const before = sent.length;
  const rowsBefore = (await store.listRsvps()).length;
  const response = await route.POST(request("POST", { ...fixture(), rsvp_extra: "https://spam.example" }));
  assert.equal(response.status, 200);
  assert.equal(sent.length, before);
  assert.equal((await store.listRsvps()).length, rowsBefore);
});

test("guest confirmations stay off without a verified sender, and the host is still notified", async () => {
  const from = process.env.NOTIFY_FROM_EMAIL;
  delete process.env.NOTIFY_FROM_EMAIL;
  try {
    const before = sent.length;
    const response = await route.POST(request("POST", fixture({ name: "No Sender" })));
    const result = await response.json();
    assert.equal(response.status, 200); assert.equal(result.confirmationStatus, "off");
    assert.equal(sent.length - before, 1); assert.deepEqual(sent.at(-1).to, ["host@example.test"]);
  } finally { process.env.NOTIFY_FROM_EMAIL = from; }
});

test("one address cannot flood the guest form", async () => {
  const flood = (i) => new Request("http://test.local/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.9" }, body: JSON.stringify(fixture({ name: `Flood ${i}` })) });
  const statuses = [];
  for (let i = 0; i < 9; i++) statuses.push((await route.POST(flood(i))).status);
  assert.deepEqual(statuses.slice(0, 8), Array(8).fill(200));
  assert.equal(statuses[8], 429);
});
