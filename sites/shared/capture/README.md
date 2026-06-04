# Lead capture — shared inline form

The explicit conversion moment for visitors who'd rather fill a form than chat
to ANNA. Vanilla JS + CSS, no build step, brand-tintable. One identical
`capture.js` + `capture.css` ships to every site; per-site fields/copy live in a
`window.LEAD_CONFIG` block in each page.

## How it works
- Renders into any `<div class="lead-capture"></div>` on the page.
- Fields: name (required), email (required + validated), one message field, GDPR
  consent (required, ethics-first). Plus a hidden honeypot for spam.
- On submit it POSTs JSON to the capture endpoint. **Until that endpoint is live
  (orchestration-owned — see REQ-005), it falls back to a prefilled `mailto:` so no
  lead is ever lost.** The day `site-lead` ships, the same form just works — no
  front-end change needed.
- If the ANNA widget is present, the form shows a "prefer to chat?" link that opens it.

## Submission payload (the contract REQ-005 must accept)
```json
{
  "site": "inspiringconnections",
  "lead_type": "connection",
  "name": "…",
  "email": "…",
  "message": "…",
  "consent": true,
  "path": "/",
  "referrer": "https://…|null",
  "ts": "2026-06-04T…Z"
}
```

## Clone / config recipe
1. Copy `capture.js` + `capture.css` into the site folder.
2. In `<head>`: `<link rel="stylesheet" href="/capture.css">`.
3. Where the conversion moment should sit, add `<div class="lead-capture"></div>`.
4. Before `</body>` (after the ANNA block if present):
   ```html
   <script>
   window.LEAD_CONFIG = {
     site: "your-slug",
     leadType: "connection",
     title: "Headline for the form",
     sub: "One reassuring line.",
     messageLabel: "The one context question",
     messagePlaceholder: "…",
     submitLabel: "Send it to John"
     // optional: brand: { teal, tealHi, accent, accentD }
   };
   </script>
   <script src="/capture.js" defer></script>
   ```

Backend (endpoint + storage) is owned by orchestration — never built in this lane.
