import { event } from "@/lib/event";

/**
 * One-off "we're live" email for everyone who gave an email address.
 * Bilingual (English, then Gujarati) because the list mixes both.
 */
export function buildLiveAnnouncementEmail() {
  const live = event.liveStreamUrl;
  const site = event.siteUrl.replace(/\/$/, "");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#f3f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Noto Sans Gujarati','Gujarati Sangam MN','Nirmala UI',sans-serif;color:#2f3d34;">
<div style="display:none;max-height:0;overflow:hidden;">Watch Nidhi &amp; Hardik's Shrimant Sanskar live on YouTube today · આજે YouTube પર લાઇવ જુઓ</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ea;"><tr><td align="center" style="padding:24px 12px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #dfe6df;border-radius:24px;overflow:hidden;border-collapse:separate;">
<tr><td align="center" style="background:#e4efe6;background-image:linear-gradient(165deg,#f6e6e2 0%,#edf2ec 52%,#e1ece3 100%);padding:28px 24px 24px;border-bottom:4px solid #f1dad5;">
<p lang="hi" style="margin:0 0 8px;color:#4e7257;font-family:'Noto Serif Devanagari','Kohinoor Devanagari',Georgia,serif;font-size:19px;line-height:1.5;">साहेब बंदगी साहेब</p>
<p style="margin:0;color:#2f3d34;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.25;">Nidhi &amp; Hardik</p>
<p style="margin:8px 0 0;color:#94534f;font-family:Georgia,serif;font-size:17px;font-style:italic;line-height:1.5;">Shrimant Sanskar &amp; Baby Shower · સીમંત વિધિ</p>
</td></tr>
<tr><td style="padding:26px 28px 6px;font-size:16px;line-height:1.7;">
<p style="margin:0 0 18px;text-align:center;"><span style="display:inline-block;padding:7px 14px;border-radius:999px;background:#fbe3e1;color:#b3261e;font-size:14px;font-weight:bold;">● LIVE TODAY · આજે લાઇવ</span></p>
<h1 style="margin:0 0 14px;color:#2f3d34;font-family:Georgia,serif;font-size:28px;font-weight:normal;line-height:1.35;text-align:center;">Watch our celebration live</h1>
<p style="margin:0 0 20px;">Our Shrimant Sanskar &amp; Baby Shower is today. Whether you're with us in person or celebrating from far away, you can watch the ceremony live on YouTube and send your blessings to our little one.</p>
<a href="${live}" style="display:block;text-decoration:none;"><img src="cid:live-banner" width="544" alt="Nidhi's Baby Shower live on YouTube — tap to watch" style="display:block;width:100%;max-width:544px;height:auto;border:0;border-radius:16px;"></a>
<p style="margin:16px 0 4px;text-align:center;color:#2f3d34;font-size:15px;font-weight:bold;">Sunday, October 25, 2026 · 10:30 AM (New Jersey time)</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;"><tr><td><a href="${live}" style="display:block;padding:15px 18px;border-radius:14px;background:#4e7257;color:#ffffff;text-align:center;text-decoration:none;font-size:16px;font-weight:bold;">▶ Watch live on YouTube</a></td></tr></table>
<p style="margin:12px 0 0;color:#5f6b62;font-size:13px;line-height:1.6;text-align:center;">Open it a few minutes early. If we haven't started yet, the video will begin playing as soon as we go live.</p>
<p aria-hidden="true" style="margin:26px 0;text-align:center;color:#94534f;font-size:14px;letter-spacing:0.5em;">· ✿ ·</p>
<div lang="gu">
<h2 style="margin:0 0 12px;color:#2f3d34;font-family:Georgia,serif;font-size:24px;font-weight:normal;line-height:1.4;text-align:center;">આજે અમારો પ્રસંગ લાઇવ જુઓ</h2>
<p style="margin:0 0 16px;">આજે અમારી સીમંત વિધિ છે. આપ રૂબરૂ પધારો કે દૂરથી જોડાઓ, YouTube પર વિધિ લાઇવ જોઈ શકશો અને અમારા નાનકડા મહેમાનને આશીર્વાદ આપી શકશો.</p>
<p style="margin:0 0 4px;text-align:center;color:#2f3d34;font-size:15px;font-weight:bold;">રવિવાર, તા. 25 ઓક્ટોબર 2026 · સવારે 10:30 (ન્યૂ જર્સી સમય)</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;"><tr><td><a href="${live}" style="display:block;padding:15px 18px;border-radius:14px;background:#4e7257;color:#ffffff;text-align:center;text-decoration:none;font-size:16px;font-weight:bold;">▶ YouTube પર લાઇવ જુઓ</a></td></tr></table>
<p style="margin:12px 0 0;color:#5f6b62;font-size:13px;line-height:1.6;text-align:center;">થોડી મિનિટ વહેલા લિંક ખોલશો. પ્રસારણ શરૂ થતાં જ વિડિયો આપોઆપ ચાલુ થશે.</p>
</div>
<p style="margin:22px 0 0;color:#5f6b62;font-size:13px;line-height:1.6;text-align:center;word-break:break-all;">${live}</p>
</td></tr>
<tr><td style="padding:8px 28px 30px;">
<p aria-hidden="true" style="margin:20px 0;text-align:center;color:#94534f;font-size:14px;letter-spacing:0.5em;">· ✿ ·</p>
<p style="margin:0;color:#5f6b62;font-size:15px;text-align:center;">With love · સ્નેહપૂર્વક,</p>
<p style="margin:2px 0 0;color:#2f3d34;font-family:Georgia,serif;font-size:22px;text-align:center;">Nidhi &amp; Hardik</p>
</td></tr>
<tr><td align="center" style="background:#f7f3ef;padding:18px 24px;color:#5f6b62;font-size:12px;line-height:1.7;">124 Crain Road, Paramus, NJ 07652<br><a href="${site}/" style="color:#4e7257;font-weight:bold;">View the invitation · આમંત્રણ જુઓ</a></td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    "साहेब बंदगी साहेब",
    "Nidhi & Hardik · Shrimant Sanskar & Baby Shower",
    "",
    "Watch our celebration live today",
    "Our Shrimant Sanskar & Baby Shower is today. Whether you're with us in person or celebrating from far away, you can watch the ceremony live on YouTube and send your blessings to our little one.",
    "Sunday, October 25, 2026 · 10:30 AM (New Jersey time)",
    `Watch live on YouTube: ${live}`,
    "",
    "આજે અમારો પ્રસંગ લાઇવ જુઓ",
    "આજે અમારી સીમંત વિધિ છે. આપ રૂબરૂ પધારો કે દૂરથી જોડાઓ, YouTube પર વિધિ લાઇવ જોઈ શકશો અને અમારા નાનકડા મહેમાનને આશીર્વાદ આપી શકશો.",
    "રવિવાર, તા. 25 ઓક્ટોબર 2026 · સવારે 10:30 (ન્યૂ જર્સી સમય)",
    `YouTube પર લાઇવ જુઓ: ${live}`,
    "",
    "With love · સ્નેહપૂર્વક,",
    "Nidhi & Hardik",
  ].join("\n");
  return {
    subject: "🔴 Live today: Nidhi & Hardik's Shrimant Sanskar · આજે લાઇવ જુઓ",
    html,
    text,
    attachments: [{ filename: "live-stream.jpg", path: `${site}/live/thumbnail.jpg`, cid: "live-banner", contentType: "image/jpeg" }],
  };
}
