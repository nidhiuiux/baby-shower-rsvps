import type { Attachment } from "resend";
import { buildIcs, directions, googleCalendarUrl } from "@/lib/calendar";
import { copy, shareLink, type Copy, type Lang } from "@/lib/copy";
import { KRISHNA_MOON_PNG } from "@/lib/email-art";
import { event } from "@/lib/event";
import { dietaryCopyKeys, rsvpRecordBlock, type GuestDetail, type Rsvp } from "@/lib/rsvp-model";

export type RsvpSource = "guest" | "manual" | "updated";
export type EmailTemplate = { subject: string; html: string; text: string; attachments?: Attachment[] };

/** The invitation's palette, written out because email clients ignore CSS variables. */
const c = {
  page: "#f3f1ea",
  card: "#ffffff",
  cream: "#f7f3ef",
  sage: "#4e7257",
  sageSoft: "#e4efe6",
  blush: "#f1dad5",
  blushDeep: "#94534f",
  ink: "#2f3d34",
  muted: "#5f6b62",
  line: "#dfe6df",
};
const serif = "Georgia,'Times New Roman',serif";
const sans = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Noto Sans Gujarati','Gujarati Sangam MN','Shruti','Nirmala UI',sans-serif";
const devanagari = "'Noto Serif Devanagari','Kohinoor Devanagari','Devanagari Sangam MN','Nirmala UI',Georgia,serif";
const ART_CID = "krishna-moon";
const siteUrl = event.siteUrl.replace(/\/$/, "");

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
const lines = (value: string) => esc(value).replace(/\n/g, "<br>");
/** Letter-spacing breaks Gujarati conjuncts, so only Latin labels are tracked. */
const tracking = (lang: Lang) => (lang === "en" ? "letter-spacing:0.16em;text-transform:uppercase;" : "");

function pill(text: string, tone: "sage" | "blush") {
  const [bg, fg] = tone === "sage" ? [c.sageSoft, c.sage] : [c.blush, c.blushDeep];
  return `<span style="display:inline-block;padding:7px 14px;border-radius:999px;background:${bg};color:${fg};font-size:14px;font-weight:bold;line-height:1.4;">${esc(text)}</span>`;
}

function chip(text: string) {
  return `<span style="display:inline-block;margin:6px 6px 0 0;padding:3px 10px;border-radius:999px;background:${c.sageSoft};color:${c.sage};font-size:13px;line-height:1.5;">${esc(text)}</span>`;
}

function button(label: string, href: string, variant: "primary" | "secondary" = "primary") {
  const primary = variant === "primary";
  return `<a href="${esc(href)}" style="display:block;padding:14px 18px;border-radius:14px;text-align:center;text-decoration:none;font-size:15px;font-weight:bold;line-height:1.3;${primary ? `background:${c.sage};color:#ffffff;border:1px solid ${c.sage};` : `background:#ffffff;color:${c.sage};border:1px solid ${c.line};`}">${esc(label)}</a>`;
}

/** Two buttons side by side; they stack naturally only in clients that cannot fit them. */
function buttonPair(left: string, right: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="50%" style="padding-right:6px;">${left}</td><td width="50%" style="padding-left:6px;">${right}</td></tr></table>`;
}

function divider() {
  return `<p aria-hidden="true" style="margin:26px 0;text-align:center;color:${c.blushDeep};font-size:14px;letter-spacing:0.5em;">· ✿ ·</p>`;
}

function sectionTitle(text: string, lang: Lang) {
  return `<p style="margin:0 0 10px;color:${c.sage};font-size:12px;font-weight:bold;line-height:1.6;${tracking(lang)}">${esc(text)}</p>`;
}

function eventDate(lang: Lang) {
  const t = copy[lang];
  const start = new Date(event.startsAt);
  const part = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "America/New_York" }).format(start);
  return lang === "gu"
    ? { month: "ઓક્ટોબર", day: part({ day: "numeric" }), weekday: "રવિવાર", full: t.detailWhenDate, time: t.detailWhenTime }
    : { month: part({ month: "short" }).toUpperCase(), day: part({ day: "numeric" }), weekday: part({ weekday: "short" }).toUpperCase(), full: part({ weekday: "long", month: "long", day: "numeric", year: "numeric" }), time: part({ hour: "numeric", minute: "2-digit" }) };
}

/** A ticket-like block with a date stamp, matching the invitation's admit-one ticket. */
function eventTicket(lang: Lang) {
  const t = copy[lang];
  const d = eventDate(lang);
  const [street, ...rest] = event.location.split(", ");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${c.line};border-radius:18px;border-collapse:separate;">
<tr>
<td width="92" align="center" valign="middle" bgcolor="${c.sageSoft}" style="background:${c.sageSoft};border-radius:17px 0 0 17px;padding:16px 6px;">
<p style="margin:0;color:${c.sage};font-size:12px;font-weight:bold;line-height:1.4;">${esc(d.month)}</p>
<p style="margin:2px 0;color:${c.ink};font-family:${serif};font-size:38px;line-height:1;">${esc(d.day)}</p>
<p style="margin:0;color:${c.muted};font-size:12px;line-height:1.4;">${esc(d.weekday)}</p>
</td>
<td valign="middle" style="padding:16px 18px;">
<p style="margin:0;color:${c.muted};font-size:12px;line-height:1.5;">${esc(t.detailWhen)}</p>
<p style="margin:2px 0 12px;color:${c.ink};font-size:15px;font-weight:bold;line-height:1.5;">${esc(d.full)}<br><span style="font-weight:normal;">${esc(d.time)}</span></p>
<p style="margin:0;color:${c.muted};font-size:12px;line-height:1.5;">${esc(t.detailWhere)}</p>
<p style="margin:2px 0 0;color:${c.ink};font-size:15px;line-height:1.5;"><strong>${esc(street)}</strong><br>${esc(rest.join(", "))}</p>
</td>
</tr>
</table>`;
}

function dietaryLabel(guest: GuestDetail, t: Copy) {
  return guest.dietary ? t[dietaryCopyKeys[guest.dietary]] : "";
}

/** Everyone in the party with their food preference as a chip and any details beneath. */
function partyList(rsvp: Rsvp, t: Copy, missing: { name: string; dietary: string }, firstLabel: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rsvp.guestDetails
    .map((guest, i) => {
      const name = guest.name || missing.name;
      const label = dietaryLabel(guest, t);
      return `<tr><td style="padding:12px 0;border-bottom:1px solid ${c.line};">
<span style="color:${c.ink};font-size:15px;font-weight:bold;line-height:1.5;overflow-wrap:anywhere;">${esc(name)}</span>${i === 0 ? ` <span style="color:${c.muted};font-size:13px;">(${esc(firstLabel)})</span>` : ""}<br>
${label ? chip(label) : `<span style="display:inline-block;margin-top:6px;color:${c.muted};font-size:13px;">${esc(missing.dietary)}</span>`}
${guest.dietaryNote ? `<p style="margin:6px 0 0;color:${c.blushDeep};font-size:14px;line-height:1.5;overflow-wrap:anywhere;">${lines(guest.dietaryNote)}</p>` : ""}
</td></tr>`;
    })
    .join("")}</table>`;
}

function noteBlock(note: string) {
  return `<p style="margin:0;padding:14px 16px;border-left:3px solid ${c.blush};background:${c.cream};border-radius:0 12px 12px 0;color:${c.ink};font-family:${serif};font-size:16px;font-style:italic;line-height:1.6;overflow-wrap:anywhere;">${lines(note)}</p>`;
}

function infoRows(entries: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;">${entries
    .map(([label, value]) => `<tr><td width="38%" valign="top" style="padding:7px 10px 7px 0;color:${c.muted};font-size:13px;line-height:1.5;">${esc(label)}</td><td valign="top" style="padding:7px 0;color:${c.ink};font-size:14px;line-height:1.5;overflow-wrap:anywhere;word-break:break-word;">${lines(value || "—")}</td></tr>`)
    .join("")}</table>`;
}

function header(lang: Lang, kind: "hero" | "compact", eyebrow: string) {
  const t = copy[lang];
  const subtitle = lang === "en" ? `${t.shrimantTitle} & ${t.title}` : t.title;
  if (kind === "compact") {
    return `<tr><td bgcolor="${c.sageSoft}" style="background:${c.sageSoft};padding:22px 28px;border-bottom:4px solid ${c.blush};">
<p style="margin:0;color:${c.sage};font-size:12px;font-weight:bold;line-height:1.6;${tracking(lang)}">${esc(eyebrow)}</p>
<p style="margin:4px 0 0;color:${c.ink};font-family:${serif};font-size:22px;line-height:1.3;">${esc(t.brand)} · ${esc(subtitle)}</p>
</td></tr>`;
  }
  return `<tr><td align="center" bgcolor="${c.sageSoft}" style="background:${c.sageSoft};background-image:linear-gradient(165deg,#f6e6e2 0%,#edf2ec 52%,#e1ece3 100%);padding:30px 24px 28px;border-bottom:4px solid ${c.blush};">
<img src="cid:${ART_CID}" width="132" height="${Math.round((132 * KRISHNA_MOON_PNG.height) / KRISHNA_MOON_PNG.width)}" alt="" style="display:block;margin:0 auto 12px;border:0;outline:none;">
<p lang="hi" style="margin:0 0 6px;color:${c.sage};font-family:${devanagari};font-size:19px;line-height:1.5;">${esc(event.blessing.title)}</p>
<p style="margin:0 0 14px;color:${c.muted};font-size:12px;line-height:1.6;${tracking(lang)}">${esc(eyebrow)}</p>
<p style="margin:0;color:${c.ink};font-family:${serif};font-size:34px;line-height:1.25;">${esc(t.brand)}</p>
<p style="margin:8px 0 0;color:${c.blushDeep};font-family:${serif};font-size:17px;font-style:italic;line-height:1.5;">${esc(subtitle)}</p>
</td></tr>`;
}

function shell(lang: Lang, preheader: string, headerHtml: string, body: string, footerNote: string, signOff = true) {
  const t = copy[lang];
  const invitation = shareLink(siteUrl, lang);
  // Tables, inline styles and system fonts keep the layout intact in Gmail, Apple Mail and Outlook.
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${esc(t.brand)}</title></head>
<body style="margin:0;padding:0;background:${c.page};font-family:${sans};color:${c.ink};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader)}&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${c.page}" style="background:${c.page};"><tr><td align="center" style="padding:24px 12px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${c.card};border:1px solid ${c.line};border-radius:24px;overflow:hidden;border-collapse:separate;">
${headerHtml}
<tr><td style="padding:30px 28px 8px;font-size:16px;line-height:1.7;">${body}</td></tr>
${signOff ? `<tr><td style="padding:8px 28px 30px;">
${divider()}
<p style="margin:0;color:${c.muted};font-size:15px;line-height:1.6;text-align:center;">${esc(t.withLove)}</p>
<p style="margin:2px 0 0;color:${c.ink};font-family:${serif};font-size:22px;line-height:1.4;text-align:center;">${esc(t.brand)}</p>
</td></tr>` : `<tr><td style="padding:0 0 22px;"></td></tr>`}
<tr><td align="center" bgcolor="${c.cream}" style="background:${c.cream};padding:20px 24px;color:${c.muted};font-size:12px;line-height:1.7;">
${esc(event.location)}<br><a href="${esc(invitation)}" style="color:${c.sage};font-weight:bold;">${esc(lang === "gu" ? "આમંત્રણ જુઓ" : "View the invitation")}</a><br>${esc(footerNote)}
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const art: Attachment = {
  filename: "krishna.png",
  // Base64 strings travel through the Resend API as-is; Buffers would be serialized as JSON.
  content: KRISHNA_MOON_PNG.base64,
  contentType: "image/png",
  contentId: ART_CID,
};

const guestCopy = {
  en: {
    eyebrow: "With Kabir Saheb's blessings",
    pillYes: (n: number) => `✓ You're coming · ${n} ${n === 1 ? "guest" : "guests"}`,
    pillNo: "Reply received",
    headingYes: "We can't wait to see you",
    greeting: (first: string) => `Dear ${first},`,
    messageYes: "We're so happy you'll be part of this special day. Your family's RSVP is saved, and we can't wait to welcome you as we celebrate our little blessing.",
    messageNo: "We'll miss having you with us, but your love and blessings mean so much as we begin this new chapter.",
    addCalendar: "Add to calendar",
    directions: "Get directions",
    smallLinks: "Apple Maps",
    icsNote: "A calendar file is attached for Apple Calendar and Outlook.",
    party: "Your family",
    note: "Your message",
    reach: "We'll reach you at",
    change: "Need to change anything? Simply reply to this email. It comes straight to us.",
    viewInvitation: "View the invitation",
    missingName: "Name to add",
    missingDietary: "Food preference to add",
    footer: "You're receiving this because you replied to Nidhi & Hardik's invitation.",
    subjectYes: "You're coming! Your RSVP is confirmed",
    subjectNo: "Thank you for your reply",
  },
  gu: {
    eyebrow: "કબીર સાહેબના આશીર્વાદ સાથે",
    pillYes: (n: number) => `✓ આપની હાજરી નોંધાઈ ગઈ · ${n} મહેમાન`,
    pillNo: "આપનો જવાબ મળી ગયો",
    headingYes: "આપની હાજરીની પુષ્ટિ થઈ ગઈ છે",
    greeting: (first: string) => `પ્રિય ${first},`,
    messageYes: "આપ અમારી ખુશીમાં સહભાગી થવા પધારશો એનો અમને ખૂબ આનંદ છે. આપના પરિવારની હાજરી નોંધાઈ ગઈ છે. સાથે મળીને આ નાનકડા મહેમાનના વધામણા કરીશું!",
    messageNo: "આપની ખોટ વર્તાશે, પરંતુ આપનો સ્નેહ અને આશીર્વાદ હંમેશાં અમારી સાથે છે.",
    addCalendar: "કૅલેન્ડરમાં ઉમેરો",
    directions: "સ્થળનો માર્ગ જુઓ",
    smallLinks: "Apple Maps",
    icsNote: "Apple Calendar અને Outlook માટે કૅલેન્ડર ફાઇલ સાથે જોડેલી છે.",
    party: "આપનો પરિવાર",
    note: "આપનો સંદેશ",
    reach: "આપનો સંપર્ક",
    change: "કોઈ વિગત બદલવી હોય તો આ ઇમેઇલનો જવાબ આપશો. જવાબ સીધો અમને મળશે.",
    viewInvitation: "આમંત્રણ જુઓ",
    missingName: "નામ ઉમેરવાનું બાકી",
    missingDietary: "ભોજનની પસંદગી બાકી",
    footer: "આપે નિધિ & હાર્દિકના આમંત્રણનો જવાબ આપ્યો હોવાથી આ ઇમેઇલ મળ્યો છે.",
    subjectYes: "આપની હાજરીની પુષ્ટિ",
    subjectNo: "જણાવવા બદલ આભાર",
  },
} as const;

export function buildGuestConfirmationEmail(rsvp: Rsvp): EmailTemplate {
  const lang = rsvp.lang;
  const t = copy[lang];
  const g = guestCopy[lang];
  const attending = rsvp.attending === "yes";
  const first = rsvp.name.split(" ")[0] || rsvp.name;
  const invitation = shareLink(siteUrl, lang);
  const calendar = googleCalendarUrl(t, invitation);
  const message = attending ? g.messageYes : g.messageNo;
  const heading = attending ? g.headingYes : t.thanksNo;
  const d = eventDate(lang);

  const body = attending
    ? `<p style="margin:0 0 18px;text-align:center;">${pill(g.pillYes(rsvp.guests), "sage")}</p>
<h1 style="margin:0 0 16px;color:${c.ink};font-family:${serif};font-size:28px;font-weight:normal;line-height:1.35;text-align:center;">${esc(heading)}</h1>
<p style="margin:0 0 8px;">${esc(g.greeting(first))}</p>
<p style="margin:0 0 24px;color:${c.ink};">${esc(message)}</p>
${eventTicket(lang)}
<div style="height:14px;line-height:14px;">&nbsp;</div>
${buttonPair(button(g.addCalendar, calendar), button(g.directions, directions.google, "secondary"))}
<p style="margin:12px 0 0;color:${c.muted};font-size:13px;line-height:1.6;text-align:center;"><a href="${esc(directions.apple)}" style="color:${c.sage};">${esc(g.smallLinks)}</a> · ${esc(g.icsNote)}</p>
${divider()}
${sectionTitle(g.party, lang)}
${partyList(rsvp, t, { name: g.missingName, dietary: g.missingDietary }, t.formYou)}
${rsvp.note ? `<div style="height:22px;line-height:22px;">&nbsp;</div>${sectionTitle(g.note, lang)}${noteBlock(rsvp.note)}` : ""}
<div style="height:22px;line-height:22px;">&nbsp;</div>
${sectionTitle(g.reach, lang)}
${infoRows([[t.formEmail, rsvp.email], [t.formPhone, rsvp.phone]])}
<p style="margin:22px 0 0;padding:14px 16px;border-radius:14px;background:${c.cream};color:${c.muted};font-size:14px;line-height:1.6;">${esc(g.change)}</p>`
    : `<p style="margin:0 0 18px;text-align:center;">${pill(g.pillNo, "blush")}</p>
<h1 style="margin:0 0 16px;color:${c.ink};font-family:${serif};font-size:28px;font-weight:normal;line-height:1.35;text-align:center;">${esc(heading)}</h1>
<p style="margin:0 0 8px;">${esc(g.greeting(first))}</p>
<p style="margin:0 0 22px;color:${c.ink};">${esc(message)}</p>
<p style="margin:0 0 22px;padding:16px 18px;border-radius:14px;background:${c.sageSoft};color:${c.sage};font-size:15px;line-height:1.6;"><strong>${esc(t.liveHeading)}</strong><br>${esc(event.liveStreamUrl ? t.liveReady : t.liveSoon)}<br><span style="color:${c.muted};font-size:14px;">${esc(`${d.full} · ${d.time}`)}</span></p>
${button(g.viewInvitation, event.liveStreamUrl || invitation)}
${rsvp.note ? `<div style="height:22px;line-height:22px;">&nbsp;</div>${sectionTitle(g.note, lang)}${noteBlock(rsvp.note)}` : ""}
<div style="height:22px;line-height:22px;">&nbsp;</div>
${sectionTitle(g.reach, lang)}
${infoRows([[t.formEmail, rsvp.email], [t.formPhone, rsvp.phone]])}
<p style="margin:22px 0 0;padding:14px 16px;border-radius:14px;background:${c.cream};color:${c.muted};font-size:14px;line-height:1.6;">${esc(g.change)}</p>`;

  const partyText = attending
    ? [
        "",
        g.party,
        ...rsvp.guestDetails.map((guest, i) => `${i + 1}. ${guest.name || g.missingName} — ${dietaryLabel(guest, t) || g.missingDietary}${guest.dietaryNote ? ` (${guest.dietaryNote})` : ""}`),
      ]
    : [];

  return {
    subject: `${attending ? g.subjectYes : g.subjectNo} · ${t.brand}`,
    html: shell(lang, message, header(lang, "hero", g.eyebrow), body, g.footer),
    text: [
      event.blessing.title,
      `${t.brand} — ${lang === "en" ? `${t.shrimantTitle} & ${t.title}` : t.title}`,
      "",
      attending ? g.pillYes(rsvp.guests) : g.pillNo,
      "",
      g.greeting(first),
      message,
      "",
      `${t.detailWhen}: ${d.full}, ${d.time}`,
      `${t.detailWhere}: ${event.location}`,
      ...(attending ? [`${g.addCalendar}: ${calendar}`, `${g.directions}: ${directions.google}`, `Apple Maps: ${directions.apple}`] : [`${t.liveHeading}: ${event.liveStreamUrl || t.liveSoon}`]),
      ...partyText,
      ...(rsvp.note ? ["", `${g.note}: ${rsvp.note}`] : []),
      "",
      `${t.formEmail}: ${rsvp.email || "—"}`,
      `${t.formPhone}: ${rsvp.phone || "—"}`,
      "",
      g.change,
      `${g.viewInvitation}: ${invitation}`,
      "",
      t.withLove,
      t.brand,
    ].join("\n"),
    attachments: attending
      ? [art, { filename: "nidhi-hardik-baby-shower.ics", content: Buffer.from(buildIcs(t, invitation)).toString("base64"), contentType: "text/calendar; charset=utf-8; method=PUBLISH" }]
      : [art],
  };
}

const sourceLabels: Record<RsvpSource, string> = {
  guest: "Guest RSVP form",
  manual: "Added by host",
  updated: "Updated by host",
};

/** Digits for tel: and WhatsApp links; a 10-digit number is treated as US (+1). */
function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `1${digits}` : digits;
}

const when = (iso: string) =>
  `${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(iso))} ET`;

export function buildHostNotificationEmail(rsvp: Rsvp, source: RsvpSource): EmailTemplate {
  const t = copy.en;
  const attending = rsvp.attending === "yes";
  const updated = source === "updated";
  const status = attending ? `Coming · ${rsvp.guests} ${rsvp.guests === 1 ? "guest" : "guests"}` : "Can't make it";
  const summary = `${rsvp.name} · ${attending ? `coming with ${rsvp.guests} ${rsvp.guests === 1 ? "guest" : "guests"} in total` : "unable to attend"}`;
  const digits = phoneDigits(rsvp.phone);
  const actions = [
    digits.length >= 7 ? button("Call", `tel:+${digits}`, "secondary") : "",
    digits.length >= 7 ? button("WhatsApp", `https://wa.me/${digits}`, "secondary") : "",
    rsvp.email ? button("Email", `mailto:${rsvp.email}`, "secondary") : "",
  ].filter(Boolean);
  const actionRow = actions.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${actions.map((a, i) => `<td width="${Math.floor(100 / actions.length)}%" style="padding:${i === 0 ? "0 4px 0 0" : i === actions.length - 1 ? "0 0 0 4px" : "0 4px"};">${a}</td>`).join("")}</tr></table>`
    : "";
  const flagged = rsvp.guestDetails.filter((guest) => guest.dietaryNote);

  const body = `<p style="margin:0;color:${c.muted};font-size:13px;line-height:1.6;">${esc(updated ? "Updated by you" : sourceLabels[source])} · ${esc(when(rsvp.updatedAt))}</p>
<h1 style="margin:6px 0 12px;color:${c.ink};font-family:${serif};font-size:28px;font-weight:normal;line-height:1.3;overflow-wrap:anywhere;">${esc(rsvp.name)}</h1>
<p style="margin:0 0 18px;">${pill(status, attending ? "sage" : "blush")}</p>
${actionRow}
${attending ? `<div style="height:24px;line-height:24px;">&nbsp;</div>${sectionTitle("Party & food", "en")}${partyList(rsvp, t, { name: "Name to add", dietary: "Food preference to add" }, "replied")}` : ""}
${flagged.length ? `<p style="margin:16px 0 0;padding:12px 14px;border-radius:12px;background:${c.blush};color:${c.blushDeep};font-size:14px;line-height:1.6;"><strong>Food notes to pass on:</strong> ${esc(flagged.map((g) => `${g.name || "Guest"}: ${g.dietaryNote}`).join(" · "))}</p>` : ""}
${rsvp.note ? `<div style="height:24px;line-height:24px;">&nbsp;</div>${sectionTitle("Their message", "en")}${noteBlock(rsvp.note)}` : ""}
<div style="height:24px;line-height:24px;">&nbsp;</div>
${sectionTitle("Details", "en")}
${infoRows([
  ["Email", rsvp.email],
  ["Phone", rsvp.phone],
  ["Confirmation language", rsvp.lang === "gu" ? "Gujarati" : "English"],
  ["Source", sourceLabels[source]],
  ["First received", when(rsvp.createdAt)],
  ["Last updated", when(rsvp.updatedAt)],
])}
<div style="height:24px;line-height:24px;">&nbsp;</div>
${button("Open guest list", `${siteUrl}/host`)}`;

  return {
    // The "RSVP Yes/No/Update:" prefix is how stored replies are found again. Keep it.
    subject: `${updated ? "RSVP Update" : `RSVP ${attending ? "Yes" : "No"}`}: ${rsvp.name.replace(/[\r\n]/g, " ")} — ${event.brand} Baby Shower`,
    html: shell("en", summary, header("en", "compact", updated ? "RSVP updated" : "New RSVP"), body, "Sent to the hosts only. Reply to reach the guest directly.", false),
    text: [
      updated ? "RSVP updated" : "New RSVP",
      summary,
      "",
      ...(attending
        ? rsvp.guestDetails.map((guest, i) => `Guest ${i + 1}: ${guest.name || "Name to add"} — ${dietaryLabel(guest, t) || "Food preference to add"}${guest.dietaryNote ? ` (${guest.dietaryNote})` : ""}`)
        : []),
      ...(rsvp.note ? ["", `Message: ${rsvp.note}`] : []),
      "",
      `Email: ${rsvp.email || "—"}`,
      `Phone: ${rsvp.phone || "—"}`,
      `Confirmation language: ${rsvp.lang === "gu" ? "Gujarati" : "English"}`,
      `Source: ${sourceLabels[source]}`,
      `First received: ${when(rsvp.createdAt)}`,
      `Last updated: ${when(rsvp.updatedAt)}`,
      "",
      `${siteUrl}/host`,
      "",
      // Storage: on Vercel this block is the durable copy of the reply.
      rsvpRecordBlock(rsvp),
    ].join("\n"),
  };
}
