# Relay by Meridian

Bilingual (ES/EN) sales referral app for anyone selling Meridian's package
service across Central America and the US. No login system, no backend
accounts — first-open picks a name, language, and market, and that device
becomes its own referrer instance.

Ground-up rebuild replacing the earlier single-person ("Elis") prototype.
See the original build spec for full product rationale; this README covers
what's implemented and what's still open.

## Stack

- Vite + React + TypeScript, single-page app (no router — screen state lives
  in `App.tsx`)
- No backend framework — one Vercel serverless function
  (`api/registrar-venta.ts`) appends sale rows to a Google Sheet
- All state on-device via `localStorage`; sales sync opportunistically and
  queue offline

## Local development

```bash
npm install
npm run dev
```

## Environment variables (Sheets sync)

Set these in the Vercel project (or a local `.env` for `vercel dev`):

| Variable | Purpose |
|---|---|
| `GOOGLE_SHEET_ID` | Target spreadsheet ID for the sales log |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account with Editor access to the sheet |
| `GOOGLE_PRIVATE_KEY` | Service account private key (`\n` newlines are unescaped at runtime) |

Without these set, `/api/registrar-venta` returns `500` and sales simply stay
queued locally (offline-first — see `src/lib/sync.ts`); nothing is lost.

## Data model

- `src/data/packages-ca.json` — Central America field pricing/copy (from the
  build spec's "Final Package Copy"). Independent of the Meridian website by
  design — see spec §1/§6.
- `src/data/packages-us.json` — **stub.** Same schema, but every package is a
  `TODO` placeholder with `precioDesde: 0` / `comision: 0`. Per spec §1a this
  content is supposed to be *ported* from the live Meridian website, not
  freshly written — do not use in the field until populated.
- `src/data/strings.json` — all UI copy, `{es, en}` pairs.

Market selection (`relay-market` in `localStorage`) picks which packages file
loads for that device.

## Open items (from the build spec — none of these block the code shipping, but do block going live)

1. **New Google Sheet.** Create one, share it with the service account
   (Editor), and set `GOOGLE_SHEET_ID`. Consider a `market` column or
   separate tabs for CA vs. US, since payout/reporting differ per spec §3.
2. **CA commission values (`comision`) are placeholders.** Package 1 ($25 on
   a $50 floor) came directly from the spec's schema example. Packages 2–4
   use the same 50%-of-`precioDesde` pattern as a placeholder
   ($50 / $175 / $350) — confirm real payout numbers before using these for
   actual commission payouts.
3. **`packages-us.json` needs real content**, ported from the current
   Meridian site copy (not a fresh rewrite — see spec §1a) once that site is
   accessible/finalized. US `comision` and `precioDesde` are a separate
   business decision from the CA file, not a converted version of it.
4. **Stripe Payment Links.** All `stripeLink` fields are empty on purpose —
   the "Pay by Card" button only renders when a package has one (see
   `PackageDetail.tsx`). Populate once Payment Links exist for current field
   pricing, and confirm billing-address collection is on for each link
   (Dashboard setting).
5. **Repo/Vercel:** dedicated repo (`meridian-relay`) and its own Vercel
   project, per the "no shared/flat-file multi-app repos" infra rule — kept
   fully separate from the `bhaves-lab` and Meridian-site codebases.

## Mechanics

Packages → Detail (context/offer/deliverables, price reveal) → Log Sale →
My Sales → Script cards. Every sale tags the on-device referrer name and
market (`relay-referrer-name`, `relay-market`), and always logs the
package's **English** name to the sheet (`name.en`) regardless of the UI
language the referrer was using, so reporting stays consistent — see
`api/registrar-venta.ts`.
