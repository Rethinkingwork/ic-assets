# Domain sites

Static, on-brand landing pages (IC palette: teal #1B9894 / orange #E1702F,
Montserrat + Open Sans). One folder per domain, each a single `index.html` —
zero build, deploys to Vercel as a static project.

| Folder | Domain | Brand accent |
|--------|--------|--------------|
| `inspiringconnections.io/` | inspiringconnections.io | teal (IC) |
| `rethinkingwork.life/`     | rethinkingwork.life     | orange |
| `rethinkingwork.co.uk/`    | rethinkingwork.co.uk    | orange (UK variant) |
| `schoolofthought.life/`    | schoolofthought.life    | purple/teal |

## Deploy (morning, ~5 min together)
For each site: create a Vercel project (root = the site folder, framework =
"Other / static"), deploy, then add the custom domain in Vercel and point DNS
at your registrar:
- A record `@` → `76.76.21.21`, or
- CNAME `www`/apex → `cname.vercel-dns.com` (Vercel shows the exact records).

DNS lives at the domain registrar and needs John's login — that's the only
step Claude can't do unattended.

## Open questions for John
- `rethinkingwork.co.uk` is currently a near-identical UK variant of
  `.life`. Decide: keep both distinct, or 301-redirect one to the other.
- Replace placeholder copy/CTA with final positioning when ready.
