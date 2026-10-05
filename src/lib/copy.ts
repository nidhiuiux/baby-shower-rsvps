import { event } from "@/lib/event";

export type Lang = "en" | "gu";

/**
 * Every guest-facing line, in English and Gujarati.
 * The Gujarati is written to read naturally, not word for word.
 * "साहेब बंदगी साहेब" is a greeting and is never translated.
 */
const en = {
  htmlLang: "en",
  languageLabel: "Language",

  gateTitle: "Tap to open",
  gateSub: "A little surprise is waiting for you ♡",
  musicPlay: "Play music",
  musicPause: "Pause music",

  eyebrow: event.eyebrow,
  brand: event.brand,
  title: event.title,
  tagline: event.tagline,
  ticketStub: "Admit one",
  ticketDates: "Oct 25 · 10:30 AM",

  blessingEyebrow: event.blessing.eyebrow,
  blessingMessage: "With hearts full of gratitude, we warmly welcome you to share in our joy.",
  kabirAlt: "Illustration of Kabir Saheb seated among lotus flowers",

  shrimantEyebrow: event.shrimant.eyebrow,
  shrimantTitle: event.shrimant.title,
  shrimantLine: event.shrimant.line,
  shrimantMessage: event.shrimant.message,

  celebrateHint: "Scroll and the letters gather",
  celebrateText: "WITH LOVE",

  countdownLabel: "Until we celebrate",
  countdownAria: "Time until the Shrimant Vidhi",
  countdownDone: "The shower is here",
  countdownUnits: ["DAYS", "HOURS", "MINUTES", "SECONDS"] as readonly string[],

  actionWhatsapp: "WhatsApp",
  actionShare: "Share",
  actionSaveDate: "Save the date",
  actionDirections: "Directions",
  actionCopy: "Copy RSVP link",
  actionCopied: "Link copied",

  detailsHeading: "A few things to know",
  detailWhen: "When",
  detailWhenDate: "Sunday, October 25",
  detailWhenTime: "10:30 in the morning",
  detailWhere: "Where",

  rsvpAria: "RSVP form",
  rsvpHeading: "Kindly RSVP",
  rsvpSub: "We can't wait to see you ♡",
  rsvpConfirmBy: `Please confirm by ${event.rsvpBy}`,

  formName: "Your name",
  formNamePlaceholder: "First and last name",
  formAttend: "Will you attend?",
  formYes: "Yes, I'll be there",
  formNo: "Sorry, can't make it",
  formGuests: "Number of guests (including you)",
  formNote: "A note",
  formOptional: "(optional)",
  formNotePlaceholder: "Dietary needs, a sweet message…",
  formSend: "Send RSVP",
  formSending: "Sending…",
  formErrName: "Please enter your name.",
  formErrChoice: "Please choose Yes or No.",
  formErrGeneric: "Something went wrong. Please try again.",
  formErrSend: "Could not send your RSVP. Please try again.",
  thanksYes: "Wonderful — see you there!",
  thanksNo: "Thank you for letting us know",
  thanksYesSub: (first: string) => `We're so glad you're coming, ${first}.`,
  thanksNoSub: (first: string) => `We'll miss you, ${first}.`,

  liveEyebrow: "Can't be there in person?",
  liveHeading: "Live Stream",
  liveSoon: "Stay tuned — we will share the live stream link right here.",
  liveReady: "Join us online and celebrate with us from wherever you are.",
  liveWhen: event.date,
  liveSoonPill: "Link coming soon",
  liveWatch: "Watch live",

  withLove: "With love,",

  calendarTitle: `${event.title} — ${event.brand}`,
  calendarDescription: (link: string) => `${event.tagline} RSVP at ${link}`,
  shareTitle: `${event.brand} | ${event.title}`,
  /** The message sent from WhatsApp, the share sheet, etc. `link` is the page address. */
  shareMessage: (link: string) =>
    [
      event.share.greeting,
      "",
      event.share.intro,
      "",
      event.share.closing,
      "",
      `🗓️ : ${event.share.date}`,
      `🕥 : ${event.share.time}`,
      `📍 : ${event.location}`,
      "",
      `RSVP by ${event.rsvpBy} 👇`,
      link,
    ].join("\n"),
};

/** Same shape as `en`, but with plain strings so Gujarati can fill each slot */
export type Copy = { [K in keyof typeof en]: (typeof en)[K] extends string ? string : (typeof en)[K] };

const gu: Copy = {
  htmlLang: "gu",
  languageLabel: "ભાષા",

  gateTitle: "ખોલવા માટે ટૅપ કરો",
  gateSub: "તમારા માટે એક નાનકડું સરપ્રાઇઝ રાહ જોઈ રહ્યું છે ♡",
  musicPlay: "સંગીત ચાલુ કરો",
  musicPause: "સંગીત બંધ કરો",

  eyebrow: "ભાવિ માતા-પિતા",
  brand: "નિધિ & હાર્દિક",
  title: "શ્રીમંત વિધિ",
  tagline:
    "તમારી સાથે આ ખુશી ઉજવવાની અમને ખૂબ મજા આવશે. તમે આવી શકશો કે નહીં, તે કૃપા કરીને અમને જણાવજો.",
  ticketStub: "Admit one",
  ticketDates: "25 ઓક્ટોબર · સવારે 10:30",

  blessingEyebrow: "સાહેબના આશીર્વાદ સાથે",
  blessingMessage: "અમારા આનંદમાં સહભાગી થવા માટે અમે તમને હૃદયપૂર્વક આવકારીએ છીએ.",
  kabirAlt: "કમળના ફૂલો વચ્ચે બેઠેલા કબીર સાહેબનું ચિત્ર",

  shrimantEyebrow: "નાનકડા મહેમાન માટે આશીર્વાદ",
  shrimantTitle: "શ્રીમંત સંસ્કાર",
  shrimantLine: "એક નાનકડો મહેમાન આવી રહ્યો છે",
  shrimantMessage:
    "પ્રાર્થના, આશીર્વાદ અને પ્રેમથી ભરેલા આ નાનકડા મેળાવડામાં અમારી સાથે જોડાઓ અને અમારા બાળકનું સ્વાગત કરો. તમારી હાજરી અમારા માટે ખૂબ મહત્વની છે.",

  celebrateHint: "સ્ક્રોલ કરો અને અક્ષરો ભેગા થશે",
  celebrateText: "પ્રેમ સહ",

  countdownLabel: "ઉજવણીને હવે બાકી",
  countdownAria: "શ્રીમંત વિધિ સુધીનો બાકી સમય",
  countdownDone: "આજે ઉજવણીનો દિવસ છે",
  countdownUnits: ["દિવસ", "કલાક", "મિનિટ", "સેકન્ડ"],

  actionWhatsapp: "WhatsApp",
  actionShare: "શેર કરો",
  actionSaveDate: "તારીખ સાચવો",
  actionDirections: "રસ્તો જુઓ",
  actionCopy: "RSVP લિંક કૉપિ કરો",
  actionCopied: "લિંક કૉપિ થઈ ગઈ",

  detailsHeading: "જાણવા જેવી થોડી વાતો",
  detailWhen: "ક્યારે",
  detailWhenDate: "રવિવાર, 25 ઓક્ટોબર",
  detailWhenTime: "સવારે 10:30 વાગ્યે",
  detailWhere: "ક્યાં",

  rsvpAria: "RSVP ફોર્મ",
  rsvpHeading: "કૃપા કરીને RSVP કરો",
  rsvpSub: "તમને મળવા માટે અમે આતુર છીએ ♡",
  rsvpConfirmBy: "કૃપા કરીને શનિવાર, 10 ઓક્ટોબર સુધીમાં જણાવશો",

  formName: "તમારું નામ",
  formNamePlaceholder: "નામ અને અટક",
  formAttend: "તમે આવશો ને?",
  formYes: "હા, હું આવીશ",
  formNo: "માફ કરજો, નહીં આવી શકું",
  formGuests: "મહેમાનોની સંખ્યા (તમારી સાથે)",
  formNote: "સંદેશ",
  formOptional: "(વૈકલ્પિક)",
  formNotePlaceholder: "જમવા અંગે કંઈ જણાવવું હોય, કે કોઈ મીઠો સંદેશ…",
  formSend: "RSVP મોકલો",
  formSending: "મોકલી રહ્યા છીએ…",
  formErrName: "કૃપા કરીને તમારું નામ લખો.",
  formErrChoice: "કૃપા કરીને હા કે ના પસંદ કરો.",
  formErrGeneric: "કંઈક ગડબડ થઈ ગઈ. કૃપા કરીને ફરી પ્રયાસ કરો.",
  formErrSend: "તમારો RSVP મોકલી શકાયો નથી. કૃપા કરીને ફરી પ્રયાસ કરો.",
  thanksYes: "અદ્ભુત — ત્યાં મળીએ!",
  thanksNo: "જણાવવા બદલ આભાર",
  thanksYesSub: (first: string) => `${first}, તમે આવી રહ્યા છો એનો અમને ખૂબ આનંદ છે.`,
  thanksNoSub: (first: string) => `${first}, તમારી ખોટ વર્તાશે.`,

  liveEyebrow: "રૂબરૂ આવી શકો તેમ નથી?",
  liveHeading: "લાઇવ પ્રસારણ",
  liveSoon: "થોડી રાહ જુઓ — લાઇવ પ્રસારણની લિંક અમે અહીં જ મૂકીશું.",
  liveReady: "ઑનલાઇન જોડાઓ અને તમે જ્યાં હો ત્યાંથી અમારી સાથે ઉજવણી કરો.",
  liveWhen: "રવિવાર, 25 ઓક્ટોબર · સવારે 10:30",
  liveSoonPill: "લિંક ટૂંક સમયમાં",
  liveWatch: "લાઇવ જુઓ",

  withLove: "પ્રેમ સહ,",

  calendarTitle: "શ્રીમંત વિધિ — નિધિ & હાર્દિક",
  calendarDescription: (link: string) =>
    `તમારી સાથે આ ખુશી ઉજવવાની અમને ખૂબ મજા આવશે. RSVP માટે: ${link}`,
  shareTitle: "નિધિ & હાર્દિક | શ્રીમંત વિધિ",
  shareMessage: (link: string) =>
    [
      event.share.greeting,
      "",
      "નિધિ & હાર્દિકના ઘરે એક નાનકડા મહેમાનના આગમનની ખુશી છે, અને અમારા શ્રીમંત વિધિમાં તમે અમારી સાથે જોડાઓ એવી અમારી દિલથી ઇચ્છા છે.",
      "",
      "આ નવા અધ્યાયમાં પ્રેમ, આશીર્વાદ અને આનંદ વહેંચવા અમારી સાથે પધારો. તમારી હાજરી અમારા માટે ખૂબ મહત્વની છે. 🤍",
      "",
      "🗓️ : રવિવાર, 25 ઓક્ટોબર, 2026",
      "🕥 : સવારે 10:30 વાગ્યાથી",
      `📍 : ${event.location}`,
      "",
      "કૃપા કરીને શનિવાર, 10 ઓક્ટોબર સુધીમાં RSVP કરશો 👇",
      link,
    ].join("\n"),
};

export const copy: Record<Lang, Copy> = { en, gu };

/** The link people receive: Gujarati shares open the page in Gujarati */
export function shareLink(origin: string, lang: Lang): string {
  return lang === "gu" ? `${origin}/?lang=gu` : origin;
}
