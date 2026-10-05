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
  countdownAria: "Time until the baby shower",
  countdownDone: "The shower is here",
  countdownUnits: ["DAYS", "HOURS", "MINUTES", "SECONDS"] as readonly string[],

  actionWhatsapp: "WhatsApp",
  actionShare: "Share",
  actionSaveDate: "Save the date",
  actionDirections: "Directions",
  actionCopy: "Copy RSVP link",
  actionCopied: "Link copied",
  actionCopyError: "Could not copy the link. Please copy the address from your browser.",

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
  shareTitle: `${event.brand} | Shrimant Sanskar & ${event.title}`,
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

  gateTitle: "આમંત્રણ ખોલવા અહીં સ્પર્શ કરો",
  gateSub: "તમારા માટે એક સુંદર આમંત્રણ રાહ જોઈ રહ્યું છે ♡",
  musicPlay: "સંગીત ચાલુ કરો",
  musicPause: "સંગીત બંધ કરો",

  eyebrow: "ભાવિ માતા-પિતા",
  brand: "નિધિ & હાર્દિક",
  title: "સીમંત વિધિ",
  tagline: "આ આનંદના અવસરે આપની ઉપસ્થિતિ અને આશીર્વાદ અમારે માટે અનમોલ રહેશે.",
  ticketStub: "Admit one",
  ticketDates: "25 ઓક્ટોબર · સવારે 10:30",

  blessingEyebrow: "કબીર સાહેબના આશીર્વાદ સાથે",
  blessingMessage: "અમારા જીવનના આ શુભ અવસરે આપને સહર્ષ આમંત્રિત કરીએ છીએ.",
  kabirAlt: "કમળના ફૂલો વચ્ચે બેઠેલા કબીર સાહેબનું ચિત્ર",

  shrimantEyebrow: "નાનકડા મહેમાન માટે આશીર્વાદ",
  shrimantTitle: "શ્રીમંત સંસ્કાર",
  shrimantLine: "અમારા આંગણે નાનકડા મહેમાનના આગમનની ખુશી…",
  shrimantMessage: "આપની ઉપસ્થિતિ અને આશીર્વાદ જ અમારે માટે સૌથી અમૂલ્ય ભેટ છે.",

  celebrateHint: "સ્ક્રોલ કરો અને અક્ષરો ભેગા થશે",
  celebrateText: "સ્નેહપૂર્વક",

  countdownLabel: "શુભ પ્રસંગને હવે…",
  countdownAria: "સીમંત વિધિ સુધીનો બાકી સમય",
  countdownDone: "આજે ઉજવણીનો દિવસ છે",
  countdownUnits: ["દિવસ", "કલાક", "મિનિટ", "સેકન્ડ"],

  actionWhatsapp: "WhatsApp પર સંપર્ક",
  actionShare: "શેર કરો",
  actionSaveDate: "તારીખ યાદ રાખો",
  actionDirections: "સ્થળનો માર્ગ જુઓ",
  actionCopy: "આમંત્રણની લિંક કૉપી કરો",
  actionCopied: "લિંક કૉપિ થઈ ગઈ",
  actionCopyError: "લિંક કૉપિ થઈ શકી નથી. કૃપા કરીને બ્રાઉઝરમાંથી સરનામું કૉપિ કરો.",

  detailsHeading: "પ્રસંગની વિગતો",
  detailWhen: "તારીખ અને સમય",
  detailWhenDate: "રવિવાર, તા. ૨૫ ઓક્ટોબર ૨૦૨૬",
  detailWhenTime: "સવારે ૧૦:૩૦ કલાકે",
  detailWhere: "શુભ સ્થળ",

  rsvpAria: "RSVP ફોર્મ",
  rsvpHeading: "કૃપા કરી તમારી હાજરી જણાવશો",
  rsvpSub: "આપની ઉપસ્થિતિની આતુરતાથી રાહ જોઈ રહ્યા છીએ ♡",
  rsvpConfirmBy: "કૃપા કરી શનિવાર, તા. ૧૦ ઓક્ટોબર સુધીમાં જણાવશો",

  formName: "આપનું નામ",
  formNamePlaceholder: "પૂરું નામ",
  formAttend: "શું આપ પ્રસંગે પધારશો?",
  formYes: "હા, જરૂર પધારીશ",
  formNo: "ક્ષમા કરશો, હાજર રહી શકીશ નહીં",
  formGuests: "મહેમાનોની સંખ્યા (આપની સાથે)",
  formNote: "કોઈ સંદેશ હોય તો લખશો",
  formOptional: "(વૈકલ્પિક)",
  formNotePlaceholder: "ભોજન અંગે કોઈ ખાસ સૂચના અથવા શુભેચ્છા સંદેશ…",
  formSend: "જવાબ મોકલો",
  formSending: "મોકલી રહ્યા છીએ…",
  formErrName: "કૃપા કરીને આપનું નામ લખો.",
  formErrChoice: "કૃપા કરીને હા કે ના પસંદ કરો.",
  formErrGeneric: "કંઈક ગડબડ થઈ ગઈ. કૃપા કરીને ફરી પ્રયાસ કરો.",
  formErrSend: "આપનો જવાબ મોકલી શકાયો નથી. કૃપા કરીને ફરી પ્રયાસ કરો.",
  thanksYes: "અદ્ભુત — ત્યાં મળીએ!",
  thanksNo: "જણાવવા બદલ આભાર",
  thanksYesSub: (first: string) => `${first}, આપ પધારી રહ્યા છો એનો અમને ખૂબ આનંદ છે.`,
  thanksNoSub: (first: string) => `${first}, આપની ખોટ વર્તાશે.`,

  liveEyebrow: "રૂબરૂ પધારી શકો તેમ નથી?",
  liveHeading: "લાઇવ પ્રસારણ",
  liveSoon: "થોડી રાહ જુઓ — લાઇવ પ્રસારણની લિંક અમે અહીં જ મૂકીશું.",
  liveReady: "ઑનલાઇન જોડાઓ અને આપ જ્યાં હો ત્યાંથી અમારી સાથે ઉજવણી કરો.",
  liveWhen: "રવિવાર, 25 ઓક્ટોબર · સવારે 10:30",
  liveSoonPill: "લિંક ટૂંક સમયમાં",
  liveWatch: "લાઇવ જુઓ",

  withLove: "સ્નેહપૂર્વક,",

  calendarTitle: "સીમંત વિધિ — નિધિ & હાર્દિક",
  calendarDescription: (link: string) =>
    `આ આનંદના અવસરે આપની ઉપસ્થિતિ અને આશીર્વાદ અમારે માટે અનમોલ રહેશે. હાજરી જણાવવા માટે: ${link}`,
  shareTitle: "નિધિ & હાર્દિક | સીમંત વિધિ",
  shareMessage: (link: string) =>
    [
      event.share.greeting,
      "",
      "સહર્ષ ખુશાલી સાથે જણાવવાનું કે અમારા પરિવારમાં આવનારા નાનકડા મહેમાનના વધામણા પ્રસંગે નિધિની સીમંત વિધિનું આયોજન રાખેલ છે.",
      "",
      "આ શુભ અવસરે આપ સપરિવાર પધારી પ્રસંગની શોભા વધારશો અને નિધિ-હાર્દિકને આશીર્વાદ આપશો એવી અમારી હાર્દિક વિનંતી.",
      "",
      "📅 રવિવાર, તા. ૨૫ ઓક્ટોબર ૨૦૨૬",
      "🕥 સવારે ૧૦:૩૦ કલાકે",
      `📍 ${event.location}`,
      "",
      "કૃપા કરી તા. ૧૦ ઓક્ટોબર સુધીમાં આપ પધારી શકશો કે નહીં તેની જાણ કરશો.",
      "",
      "🔗 આમંત્રણ અને હાજરીની જાણ:",
      link,
      "",
      "આપની ઉપસ્થિતિ અને આશીર્વાદ જ અમારે માટે અનમોલ છે. 🙏",
    ].join("\n"),
};

export const copy: Record<Lang, Copy> = { en, gu };

/** The link people receive: Gujarati shares open the page in Gujarati */
export function shareLink(origin: string, lang: Lang): string {
  return lang === "gu" ? `${origin}/?lang=gu` : origin;
}
