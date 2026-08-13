import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from 'googleapis'

interface SaleBody {
  id: string
  timestamp: string
  referrerName: string
  market: 'ca' | 'us'
  packageId: number | string
  packageNameEn: string
  packageNameLocal: string
  businessName: string
  contactInfo?: string
  price: number
  // null means "negotiated" — always the case for US sales, never a
  // dollar figure to fall back on. See comment at the append call below.
  comision: number | null
  paymentMethod: string
  notes?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // .trim() guards against stray whitespace/newlines from a copy-paste
  // accident in the Vercel dashboard (e.g. a duplicated/blank-line-padded
  // value) — it won't fix a genuinely wrong value, just stray padding
  // around a correct one.
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim()
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim()

  if (!sheetId || !clientEmail || !privateKey) {
    res.status(500).json({ error: 'Sheets sync is not configured (missing GOOGLE_SHEET_ID / GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY)' })
    return
  }

  const sale = req.body as SaleBody
  if (!sale?.businessName || !sale?.packageId || !sale?.referrerName || !sale?.market) {
    res.status(400).json({ error: 'Missing required sale fields' })
    return
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })

    // Column order matches the "Meridian Relay — Sales Log" sheet's actual
    // header row exactly: Date | Business | Package | Commission |
    // Payment Type | Trade Details | Delivered to Engineer | Referrer.
    // "Delivered to Engineer" is a manual ops field the app has no data
    // for, so it's always left blank for staff to fill in later.
    //
    // Package name always logs in English (sale.packageNameEn, sourced
    // from packages-*.json name.en) so the sheet stays consistent
    // regardless of which language the referrer had the UI in — see
    // build spec §4.
    //
    // NOTE: this sheet has no column for market, packageId, price, or
    // contactInfo — those fields are captured by the app but currently
    // have nowhere to go in this log. See README for the open item.
    const paymentTypeLabel: Record<string, string> = { cash: 'Cash', card: 'Card', trade: 'Trade' }

    const row = [
      sale.timestamp,
      sale.businessName,
      sale.packageNameEn,
      // Deliberate market check, not a fallback — a US sale's null
      // comision always logs as the literal 'negotiated', never 0
      // or blank (which would misread as "no commission").
      sale.comision === null ? 'negotiated' : sale.comision,
      paymentTypeLabel[sale.paymentMethod] ?? sale.paymentMethod,
      sale.notes ?? '',
      '',
      sale.referrerName,
    ]
    console.log('registrar-venta request body', JSON.stringify(sale))
    console.log('Sheets append row', JSON.stringify(row))

    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    })
    console.log('Sheets append response', JSON.stringify(appendResult.data))

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Sheets sync failed', err)
    res.status(502).json({ error: 'Sheets sync failed' })
  }
}
