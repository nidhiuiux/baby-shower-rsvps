import { copy, type Lang } from "@/lib/copy";
import { event } from "@/lib/event";
import { dietaryCopyKeys, rsvpRecordBlock, type Rsvp } from "@/lib/rsvp-model";

export type RsvpSource = "guest" | "manual" | "updated";
export type EmailTemplate = { subject: string; html: string; text: string };
const colors = { cream: "#f7f3ef", sage: "#4e7257", pale: "#e4efe6", blush: "#f1dad5", ink: "#2f3d34", muted: "#59655d", line: "#d7e1d8" };
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const multiline = (value: string) => escape(value).replace(/\n/g, "<br>");
const siteUrl = event.siteUrl.replace(/\/$/, "");

function button(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td bgcolor="${colors.sage}" style="border-radius:28px;text-align:center;"><a href="${escape(href)}" style="display:inline-block;padding:15px 24px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">${escape(label)}</a></td></tr></table>`;
}

function rows(entries: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;">${entries.map(([label, value]) => `<tr><td width="36%" valign="top" style="padding:12px 8px 12px 0;border-bottom:1px solid ${colors.line};font-size:13px;color:${colors.muted};">${escape(label)}</td><td valign="top" style="padding:12px 0;border-bottom:1px solid ${colors.line};font-size:15px;overflow-wrap:anywhere;word-break:break-word;">${multiline(value || "—")}</td></tr>`).join("")}</table>`;
}

function shell(lang: Lang, preheader: string, heading: string, body: string) {
  const t = copy[lang];
  // Tables, inline styles and system fonts also work with email images disabled.
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(heading)}</title></head>
<body style="margin:0;padding:0;background:${colors.cream};font-family:Arial,'Nirmala UI','Gujarati Sangam MN',sans-serif;color:${colors.ink};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escape(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${colors.cream}"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${colors.line};border-radius:24px;overflow:hidden;">
<tr><td align="center" bgcolor="${colors.pale}" style="padding:32px 22px 26px;border-bottom:5px solid ${colors.blush};">
<p style="margin:0 0 16px;color:${colors.sage};font-size:12px;line-height:1.6;">${escape(t.blessingEyebrow)}</p>
<p aria-hidden="true" style="margin:0 0 12px;color:${colors.sage};font-family:Georgia,serif;font-size:30px;">✿</p>
<p style="margin:0;font-family:Georgia,'Nirmala UI',serif;font-size:32px;line-height:1.3;">${escape(t.brand)}</p>
<p style="margin:8px 0 0;font-size:14px;color:${colors.muted};">${escape(t.shrimantTitle)}${lang === "en" ? " &amp; Baby Shower" : ""}</p>
</td></tr>
<tr><td style="padding:28px 22px;font-size:16px;line-height:1.75;">
<h1 style="margin:0 0 20px;font-family:Georgia,'Nirmala UI',serif;font-size:27px;font-weight:normal;line-height:1.4;">${escape(heading)}</h1>
${body}
<p style="margin:28px 0 0;color:${colors.muted};">${escape(t.withLove)}<br><strong style="color:${colors.ink};">${escape(t.brand)}</strong></p>
</td></tr>
<tr><td align="center" bgcolor="${colors.cream}" style="padding:20px 22px;font-size:12px;line-height:1.7;color:${colors.muted};">${escape(event.location)}<br><a href="${siteUrl}" style="color:${colors.sage};">${escape(lang === "gu" ? "આમંત્રણ જુઓ" : "View the invitation")}</a></td></tr>
</table></td></tr></table></body></html>`;
}

function responseRows(rsvp: Rsvp, lang: Lang): [string, string][] {
  const t = copy[lang];
  const entries: [string, string][] = [[t.recapName, rsvp.name], [t.formEmail, rsvp.email], [t.formPhone, rsvp.phone], [t.recapAttending, rsvp.attending === "yes" ? t.formYes : t.formNo]];
  if (rsvp.attending === "yes") {
    entries.push([t.recapGuests, String(rsvp.guests)]);
    rsvp.guestDetails.forEach((guest, i) => entries.push([t.formGuestLabel(i + 1), [guest.name || "—", guest.dietary ? t[dietaryCopyKeys[guest.dietary]] : "—", guest.dietaryNote].filter(Boolean).join(" · ")]));
  }
  if (rsvp.note) entries.push([t.recapNote, rsvp.note]);
  return entries;
}

function calendarLink() {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const query = new URLSearchParams({ action: "TEMPLATE", text: `${event.brand} · ${event.title}`, dates: `${stamp(event.startsAt)}/${stamp(event.endsAt)}`, location: event.location, details: `${event.shrimant.title}\n${siteUrl}`, ctz: "America/New_York" });
  return `https://calendar.google.com/calendar/render?${query}`;
}

export function buildGuestConfirmationEmail(rsvp: Rsvp): EmailTemplate {
  const lang = rsvp.lang, t = copy[lang], attending = rsvp.attending === "yes";
  const heading = attending ? (lang === "gu" ? "આપની હાજરીની પુષ્ટિ થઈ ગઈ છે" : "A little joy, saved for you") : t.thanksNo;
  const message = attending
    ? (lang === "gu" ? "આપ અમારી ખુશીમાં સહભાગી થવા પધારશો એનો અમને ખૂબ આનંદ છે. આપના પરિવારની હાજરી નોંધાઈ ગઈ છે. સાથે મળીને આ નાનકડા મહેમાનના વધામણા કરીશું!" : "We’re so happy you’ll be part of this special day. Your family’s RSVP is saved, and we can’t wait to welcome you as we celebrate our little blessing.")
    : (lang === "gu" ? "આપ રૂબરૂ પધારી શકશો નહીં તે જણાવવા બદલ આભાર. આપની ખોટ વર્તાશે, પરંતુ આપનો સ્નેહ અને આશીર્વાદ હંમેશાં અમારી સાથે છે." : "Thank you for letting us know. We’ll miss having you with us, but your love and blessings mean so much as we begin this new chapter.");
  const date = new Intl.DateTimeFormat(lang === "gu" ? "gu-IN" : "en-US", { dateStyle: "full", timeZone: "America/New_York" }).format(new Date(event.startsAt));
  const when: [string, string][] = [[t.detailWhen, `${date}\n${lang === "gu" ? "સવારે 10:30 · ન્યૂ જર્સીનો સ્થાનિક સમય" : "10:30 AM · New Jersey local time"}`], [t.detailWhere, event.location]];
  const details = responseRows(rsvp, lang);
  const correction = lang === "gu" ? "કોઈ વિગત બદલવી હોય તો આ ઇમેઇલનો જવાબ આપશો." : "Need to change a detail? Just reply to this email.";
  const greeting = lang === "gu" ? `પ્રિય ${rsvp.name},` : `Dear ${rsvp.name},`;
  const invitationUrl = `${siteUrl}/${lang === "gu" ? "?lang=gu" : ""}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
  const body = `<p>${escape(greeting)}</p><p>${escape(message)}</p>${rows(when)}
<div style="padding:24px 0;">${button(lang === "gu" ? "આમંત્રણ જુઓ" : "View your invitation", invitationUrl)}</div>
${attending ? `<p style="text-align:center;font-size:14px;"><a href="${escape(calendarLink())}" style="color:${colors.sage};">${escape(t.actionSaveDate)}</a> &nbsp; · &nbsp; <a href="${escape(maps)}" style="color:${colors.sage};">${escape(t.getDirections)}</a></p>` : `<p style="color:${colors.muted};">${escape(event.liveStreamUrl ? t.liveReady : t.liveSoon)}</p>`}
<h2 style="margin:28px 0 6px;font-family:Georgia,'Nirmala UI',serif;font-size:21px;font-weight:normal;">${escape(t.recapTitle)}</h2>${rows(details)}<p style="font-size:14px;color:${colors.muted};">${escape(correction)}</p>`;
  return {
    subject: `${attending ? (lang === "gu" ? "આપની હાજરીની પુષ્ટિ" : "Your RSVP is confirmed") : (lang === "gu" ? "જણાવવા બદલ આભાર" : "Thank you for your reply")} · ${t.brand}`,
    html: shell(lang, message, heading, body),
    text: [t.blessingEyebrow, t.brand, t.shrimantTitle, "", greeting, message, "", ...when.map(([k,v]) => `${k}: ${v}`), "", ...details.map(([k,v]) => `${k}: ${v}`), "", invitationUrl, ...(attending ? [calendarLink(), maps] : [event.liveStreamUrl ? t.liveReady : t.liveSoon]), "", correction, t.withLove, t.brand].join("\n"),
  };
}

export function buildHostNotificationEmail(rsvp: Rsvp, source: RsvpSource): EmailTemplate {
  const heading = source === "updated" ? "An RSVP has been updated" : "A new reply for your little celebration";
  const sourceLabel = source === "guest" ? "Guest RSVP form" : source === "manual" ? "Added by host" : "Updated by host";
  const details: [string, string][] = [...responseRows(rsvp, "en"), ["Confirmation language", rsvp.lang === "gu" ? "Gujarati" : "English"], ["Source", sourceLabel], ["First received", new Date(rsvp.createdAt).toLocaleString("en-US", { timeZone: "America/New_York" })], ["Last updated", new Date(rsvp.updatedAt).toLocaleString("en-US", { timeZone: "America/New_York" })]];
  const summary = `${rsvp.name} · ${rsvp.attending === "yes" ? `Coming with ${rsvp.guests} guest${rsvp.guests === 1 ? "" : "s"} in total` : "Unable to attend"}`;
  return {
    subject: `${source === "updated" ? "RSVP Update" : `RSVP ${rsvp.attending === "yes" ? "Yes" : "No"}`}: ${rsvp.name.replace(/[\r\n]/g, " ")} — ${event.brand} Baby Shower`,
    html: shell("en", summary, heading, `<p>${escape(summary)}</p>${rows(details)}<div style="padding-top:28px;">${button("Open guest list", `${siteUrl}/host`)}</div>`),
    text: [heading, summary, "", ...details.map(([k,v]) => `${k}: ${v}`), "", `${siteUrl}/host`, "", rsvpRecordBlock(rsvp)].join("\n"),
  };
}
