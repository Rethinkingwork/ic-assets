# Pasting the signatures into Gmail

Gmail signatures can't be set programmatically — you paste them in once, per
account. Two minutes each. Do this once and they render for everyone you email.

There are two files:

| File | Gmail account |
| --- | --- |
| `signature-inspiringconnections.html` | **john@inspiringconnections.io** |
| `signature-rethinkingwork.html` | **john@rethinkingwork.life** |

---

## Why the old logo showed as a broken box

The previous signature pointed its logo at an image Gmail couldn't fetch — almost
always a Google Drive link or a pasted/attached image. Recipients' mail clients
only render images from a **public HTTPS URL**. These new signatures use a public
logo served from the live site, so the logo renders for everyone:

- IC → `https://inspiringconnections.io/logo-email.png`
- RW → `https://rethinkingwork.life/logo-email.png`

> **One-time prerequisite:** these logo files ship with this update and go live
> when the brand sites next deploy. After deploy, open each URL in a browser —
> you should see the logo. If you do, the signature will too. (Until then the
> signature shows the brand name as text where the logo will appear.)

---

## The reliable way to paste HTML into Gmail (recommended)

Gmail's signature box is a rich-text editor — it pastes *rendered* HTML, not raw
code. So render the file first, then copy the rendered result:

1. **Open the `.html` file in a web browser** (double-click it, or drag it into a
   browser tab). You'll see the finished signature — name, title, logo, button.
2. **Select all of it** — click just before the logo and drag to just after the
   "Book a conversation" button (or press `Ctrl/Cmd + A` inside the page).
3. **Copy** (`Ctrl/Cmd + C`).
4. In Gmail: **Settings (gear) → See all settings → General → Signature**.
5. **Create new** (name it e.g. "IC" or "RW"), click into the signature box, and
   **Paste** (`Ctrl/Cmd + V`).
6. Under **Signature defaults**, set this signature for **new emails** and
   **replies/forwards**.
7. Scroll down and **Save changes**.
8. Compose a test email **to yourself** and confirm the logo renders and the
   links work. (Send only to yourself — no real recipients.)

Repeat for the second account (switch Gmail account, or do it in that account's
settings).

> The block to copy sits between the `░░░ PASTE FROM HERE ░░░` and
> `░░░ TO HERE ░░░` comment markers in each file — but the easiest path is just to
> open the file in a browser and copy the rendered signature as in step 2.

---

## If a logo ever stops rendering

1. Open the logo URL above directly in a browser. If it 404s, the site needs
   (re)deploying with the `logo-email*.png` files in its folder.
2. Check the `<img src="…">` in the signature is the full `https://…` URL (not a
   Drive link, not a local path).
3. Some clients block images until the reader clicks "show images" — that's a
   per-recipient setting, not a fault in the signature.

---

## What each signature contains

- Name, title, company
- The rendering logo (public HTTPS PNG, fixed width)
- Brand tagline in IC teal
- Email + website links
- An orange **Book a conversation** button → `https://calendly.com/rethinkingwork`
  (John's real Calendly)

All inline-styled and table-based, so they hold together across Gmail, Outlook,
and Apple Mail.
