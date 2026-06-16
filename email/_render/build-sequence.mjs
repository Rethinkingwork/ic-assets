// build-sequence.mjs — generate onboarding emails 02–05 from a shared scaffold,
// so every email carries IDENTICAL header/card/footer chrome and only the message
// changes. Run from email/:  node _render/build-sequence.mjs
// (Email 01 is hand-authored as the reference; this regenerates 02–05.)
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../onboarding-sequence');

// ── Brand constants (mirror sites/shared/brand.css + cis-portals/lib/brand.js) ──
const LOGO = 'https://kntrbfrhajtvbuupyntu.supabase.co/storage/v1/object/public/brand-assets/ic-logo-email-horizontal.png';
const SITE = 'https://inspiringconnections.io';
const SCORECARD = 'https://cis-portals.vercel.app/scorecard';
const GETSTARTED = 'https://cis-portals.vercel.app/start';
const CALENDLY = 'https://calendly.com/rethinkingwork';

// Button: bulletproof (VML for Outlook + standard anchor for everyone else).
function button(url, label, width = 280) {
  return `
              <tr><td class="ic-px" style="padding:12px 40px 16px 40px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td align="center" bgcolor="#E1702F" style="border-radius:12px;">
                    <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:48px;v-text-anchor:middle;width:${width}px;" arcsize="25%" strokecolor="#E1702F" fillcolor="#E1702F"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${label}</center></v:roundrect><![endif]-->
                    <!--[if !mso]><!-- --><a class="ic-btn-a" href="${url}" target="_blank" style="display:inline-block;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;padding:15px 30px;border-radius:12px;background-color:#E1702F;">${label}</a><!--<![endif]-->
                  </td>
                </tr></table>
              </td></tr>`;
}

// A soft cream "tip strip" with a teal left rule — used for the quick-win lists.
function tipStrip(rowsHtml) {
  return `
              <tr><td class="ic-px" style="padding:4px 40px 20px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FDFCF8;border:1px solid #E6E2D8;border-left:4px solid #1B9894;border-radius:10px;">
                  <tr><td style="padding:18px 22px;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3a3a3a;">
                    ${rowsHtml}
                  </td></tr>
                </table>
              </td></tr>`;
}

function numberedItem(n, title, body) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px 0;"><tr>
      <td width="30" valign="top" style="font-family:'Montserrat',Arial,sans-serif;font-size:15px;font-weight:800;color:#1B9894;">${n}</td>
      <td valign="top" style="font-family:'Open Sans',Arial,sans-serif;font-size:15px;line-height:1.55;color:#3a3a3a;"><strong style="color:#2D2D2D;">${title}</strong><br>${body}</td>
    </tr></table>`;
}
function bulletItem(body) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px 0;"><tr>
      <td width="22" valign="top" style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#E1702F;">→</td>
      <td valign="top" style="font-family:'Open Sans',Arial,sans-serif;font-size:15px;line-height:1.55;color:#3a3a3a;">${body}</td>
    </tr></table>`;
}

// Full-email scaffold — header, card, sign-off, footer. Only `inner` varies.
function page({ title, preheader, eyebrow, headline, inner }) {
  return `<!doctype html>
<html lang="en-GB" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${title}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body{margin:0!important;padding:0!important;width:100%!important;}
    table{border-collapse:collapse!important;}
    img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
    a{color:#156E6B;}
    @media only screen and (max-width:620px){
      .ic-container{width:100%!important;}
      .ic-px{padding-left:24px!important;padding-right:24px!important;}
      .ic-h1{font-size:26px!important;line-height:1.18!important;}
      .ic-btn-a{display:block!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F8F7F4;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#F8F7F4;opacity:0;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F7F4;">
    <tr>
      <td align="center" style="padding:24px 12px 40px 12px;">
        <table role="presentation" class="ic-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

          <tr><td style="padding:8px 8px 20px 8px;">
            <a href="${SITE}" target="_blank" style="text-decoration:none;">
              <img src="${LOGO}" width="220" height="55" alt="Inspiring Connections" style="display:block;width:220px;height:auto;border:0;">
            </a>
          </td></tr>

          <tr><td style="background-color:#FFFFFE;border:1px solid #E6E2D8;border-radius:16px;overflow:hidden;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:4px;background-color:#1B9894;font-size:0;line-height:0;">&nbsp;</td></tr></table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td class="ic-px" style="padding:36px 40px 8px 40px;">
                <p style="margin:0 0 6px 0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1B9894;">${eyebrow}</p>
                <h1 class="ic-h1" style="margin:0 0 16px 0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:30px;line-height:1.15;font-weight:800;letter-spacing:-0.5px;color:#2D2D2D;">${headline}</h1>
              </td></tr>
${inner}
            </table>
          </td></tr>

          <tr><td class="ic-px" style="padding:28px 8px 4px 8px;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#3a3a3a;">
            <p style="margin:0 0 2px 0;">Warmly,</p>
            <p style="margin:0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-weight:700;color:#2D2D2D;">John Bennett</p>
            <p style="margin:0;font-size:14px;color:#7A7A7A;">Founder, Inspiring Connections</p>
          </td></tr>

          <tr><td class="ic-px" style="padding:28px 8px 8px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #E6E2D8;height:1px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
          <tr><td class="ic-px" style="padding:8px 8px 0 8px;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#9A9A9A;">
            <p style="margin:0 0 6px 0;"><strong style="color:#5A5A5A;">Inspiring Connections</strong> — relationship intelligence, built on trust.<br>Purposeful connection unlocks potential.</p>
            <p style="margin:0 0 6px 0;"><a href="${SITE}" target="_blank" style="color:#156E6B;text-decoration:none;">inspiringconnections.io</a>&nbsp;·&nbsp;<a href="mailto:john@inspiringconnections.io" style="color:#156E6B;text-decoration:none;">john@inspiringconnections.io</a></p>
            <p style="margin:0;">You're receiving this because you signed up at Inspiring Connections. <a href="{{unsubscribe_url}}" target="_blank" style="color:#9A9A9A;text-decoration:underline;">Unsubscribe</a>&nbsp;·&nbsp;<a href="{{preferences_url}}" target="_blank" style="color:#9A9A9A;text-decoration:underline;">Email preferences</a></p>
          </td></tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Helper to wrap body paragraphs in the standard padded text cell.
function para(html) {
  return `              <tr><td class="ic-px" style="padding:0 40px 8px 40px;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#3a3a3a;">
${html}
              </td></tr>`;
}
function spacer(px = 28) {
  return `              <tr><td style="height:${px}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 02 — GET STARTED / HOW IT WORKS  (send ~day 1)
// ─────────────────────────────────────────────────────────────────────────────
const e02 = page({
  title: 'How Inspiring Connections works',
  preheader: 'Three small steps to get value from day one.',
  eyebrow: 'Getting started',
  headline: 'Three steps, and you’re away.',
  inner:
    para(`<p style="margin:0 0 16px 0;">Hi {{first_name}},</p>
                <p style="margin:0 0 16px 0;">Now you’re in, here’s the whole thing in plain English. Inspiring Connections turns your network into genuine understanding — who matters, why, and how to actually help — so you make fewer, better connections instead of more noise.</p>
                <p style="margin:0 0 4px 0;">It’s three simple steps:</p>`) +
    tipStrip(
      numberedItem('01', 'Capture', 'Conversations from meetings and LinkedIn become structured intelligence — nothing relies on memory.') +
      numberedItem('02', 'Intelligence', 'We read each conversation for needs, pains and signals, then score the match. Evidence over assertion, always.') +
      numberedItem('03', 'Connection', 'The right introduction, to the right person, at the right moment — grounded in what each party genuinely needs.')
    ) +
    para(`<p style="margin:0;">The best first move is to get your workspace set up. It takes a couple of minutes, and everything else builds from there.</p>`) +
    button(GETSTARTED, 'Set up your workspace') +
    para(`<p style="margin:0 0 16px 0;color:#7A7A7A;font-size:14px;">Stuck on anything at all? Just reply to this email — it comes straight to me, and I read every one.</p>`) +
    spacer(8),
});

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 03 — KEY FEATURE / QUICK WIN  (send ~day 3) — the Scorecard
// ─────────────────────────────────────────────────────────────────────────────
const e03 = page({
  title: 'Your Connection Intelligence Scorecard',
  preheader: 'Two minutes for a number that’s genuinely worth knowing.',
  eyebrow: 'Quick win',
  headline: 'How intentional are you, really?',
  inner:
    para(`<p style="margin:0 0 16px 0;">Hi {{first_name}},</p>
                <p style="margin:0 0 16px 0;">Most of us think we’re deliberate about our relationships. The truth is usually messier — good people slip through the cracks, follow-ups never happen, and the best introductions are the ones we never quite get round to making.</p>
                <p style="margin:0 0 16px 0;">The <strong style="color:#2D2D2D;">Connection Intelligence Scorecard</strong> gives you an honest read in about two minutes. You’ll get a score, a short profile of how you connect, and a few practical pointers you can use straight away.</p>`) +
    tipStrip(
      bulletItem('See where your relationship habits are strong — and where they quietly leak value.') +
      bulletItem('Get a number to beat, so progress is something you can actually feel.') +
      bulletItem('No sign-in, no homework. Two minutes, genuinely.')
    ) +
    button(SCORECARD, 'Take the Scorecard') +
    para(`<p style="margin:0;color:#7A7A7A;font-size:14px;">It’s free, it’s quick, and the result tends to surprise people in the best way. Give it a go and tell me what you scored.</p>`) +
    spacer(8),
});

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 04 — TIPS / USE CASE  (send ~day 7)
// ─────────────────────────────────────────────────────────────────────────────
const e04 = page({
  title: 'A small habit that changes everything',
  preheader: 'The one question that makes every introduction land.',
  eyebrow: 'Make it work for you',
  headline: 'The tools tell you what. We tell you why.',
  inner:
    para(`<p style="margin:0 0 16px 0;">Hi {{first_name}},</p>
                <p style="margin:0 0 16px 0;">Here’s the shift that does most of the heavy lifting. Before you reach out to anyone, swap the usual question — <em>“what do I want from this person?”</em> — for a better one:</p>
                <p style="margin:0 0 16px 0;font-family:'Montserrat',Arial,sans-serif;font-size:19px;font-weight:700;color:#156E6B;line-height:1.3;">“What does a brilliant outcome look like for <em>them</em>?”</p>
                <p style="margin:0 0 16px 0;">It sounds small. It isn’t. It’s the difference between outreach people ignore and a message that feels like a gift. A few ways to put it to work this week:</p>`) +
    tipStrip(
      bulletItem('<strong style="color:#2D2D2D;">Lead with their context.</strong> One specific, true line about them beats three about you.') +
      bulletItem('<strong style="color:#2D2D2D;">Make the warm intro you’ve been putting off.</strong> Two people who should know each other — say why, then step back.') +
      bulletItem('<strong style="color:#2D2D2D;">Capture the “why”, not just the “who”.</strong> What someone’s really trying to do is the part worth remembering.')
    ) +
    para(`<p style="margin:0;">That’s the whole philosophy in miniature: human-led, evidence-based, and genuinely useful to the person on the other end.</p>`) +
    button(SCORECARD, 'See how intentional you are') +
    spacer(8),
});

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 05 — CHECK-IN / BOOK A CALL / FEEDBACK  (send ~day 14)
// ─────────────────────────────────────────────────────────────────────────────
const e05 = page({
  title: 'How’s it going so far?',
  preheader: 'A genuine check-in — and an open invitation to talk.',
  eyebrow: 'Let’s talk',
  headline: 'How’s it going, {{first_name}}?',
  inner:
    para(`<p style="margin:0 0 16px 0;">Hi {{first_name}},</p>
                <p style="margin:0 0 16px 0;">You’ve been with us a couple of weeks now, so I wanted to check in properly — not with a pitch, just genuine interest in how you’re getting on.</p>
                <p style="margin:0 0 16px 0;">If Inspiring Connections is already proving useful, I’d love to hear what’s landed. And if it isn’t quite clicking yet, I’d <em>especially</em> love to hear that — it’s the feedback that makes this better for everyone.</p>
                <p style="margin:0 0 16px 0;">The easiest way is a short, no-agenda conversation. Grab a time that suits you and we’ll talk through whatever would help most:</p>`) +
    button(CALENDLY, 'Book a 20-minute chat') +
    para(`<p style="margin:0 0 16px 0;">Prefer to keep it brief? Just hit reply and tell me one thing — what would make this genuinely worth your while? Every reply reaches me directly.</p>
                <p style="margin:0;">Thank you for giving us a go. It means a great deal.</p>`) +
    spacer(8),
});

// ── Write the files ──────────────────────────────────────────────────────────
const files = {
  '02-getting-started.html': e02,
  '03-quick-win-scorecard.html': e03,
  '04-tips-use-case.html': e04,
  '05-check-in.html': e05,
};
for (const [name, html] of Object.entries(files)) {
  writeFileSync(resolve(OUT, name), html);
  console.log('wrote', name);
}
