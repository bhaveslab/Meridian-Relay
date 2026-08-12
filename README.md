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

CA and US packages are **not** the same schema — `src/types.ts` defines them
as a discriminated union (`CaPackage | UsPackage`, keyed by a `market` field
baked into each JSON entry) and every screen branches on `pkg.market`
deliberately rather than assuming one shape fits both. Don't try to unify
them into one shape without checking with the business first.

- `src/data/packages-ca.json` — Central America field set. Narrative copy
  (`hook`/`contexto`/`oferta`), a fixed `entregables` list, an `icon` +
  `tier`, and a flat dollar `comision`. **Pricing/commission are final,
  locked numbers** (not placeholders): $75/$25, $350/$100, $750/$200,
  $1,500/$350 for packages 1–4. Independent of the Meridian website by
  design — see spec §1/§6.
- `src/data/packages-us.json` — US sales force set. Single `description`
  instead of hook/contexto/oferta, no icon/tier, optional priced `subtiers`
  (only "Web Architecture" has them), and `comisionNegociada: true` instead
  of a flat `comision` — commission is negotiated per deal, never a fixed
  dollar figure.
- `src/data/strings.json` — all UI copy, `{es, en}` pairs.

Market selection (`relay-market` in `localStorage`) picks which packages file
loads for that device — see `AppContext.tsx`.

### Commission display — deliberate branch, not a fallback

Every screen that shows a commission (`PackageDetail`, `LogSale`, `MySales`)
checks `pkg.market`/`sale.comision === null` explicitly. CA always shows a
dollar amount; US always shows "Commission: Negotiated" / "Comisión:
negociada" — never a number, never a silent `$0`. `Sale.comision` is
`number | null`, where `null` means negotiated; the Sheets sync
(`api/registrar-venta.ts`) writes the literal `'negotiated'` for those rows
rather than a blank or zero, so reporting can't misread it as "no
commission."

## Open items (from the build spec — none of these block the code shipping, but do block going live)

1. **New Google Sheet.** Create one, share it with the service account
   (Editor), and set `GOOGLE_SHEET_ID`. Consider a `market` column or
   separate tabs for CA vs. US, since payout/reporting differ per spec §3 —
   and US rows will have `'negotiated'` in the commission column instead of
   a number.
2. **Stripe Payment Links.** All `stripeLink` fields are empty on purpose —
   the "Pay by Card" button only renders when a package has one (CA only;
   US packages don't have a `stripeLink` field at all). Populate once
   Payment Links exist for current field pricing, and confirm
   billing-address collection is on for each link (Dashboard setting).
3. **Repo/Vercel:** dedicated repo (`meridian-relay`) and its own Vercel
   project, per the "no shared/flat-file multi-app repos" infra rule — kept
   fully separate from the `bhaves-lab` and Meridian-site codebases.

## Mechanics

Packages → Detail (price reveal) → Log Sale → My Sales → Script cards. Every
sale tags the on-device referrer name and market (`relay-referrer-name`,
`relay-market`), and always logs the package's **English** name to the sheet
(`name.en`) regardless of the UI language the referrer was using, so
reporting stays consistent — see `api/registrar-venta.ts`.
