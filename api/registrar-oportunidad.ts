import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from 'googleapis'

interface TradeDetailsBody {
  role?: string
  country?: string
  location?: string
  flow?: string
  category?: string
  product?: string
  quantity?: string
  unit?: string
  recurrence?: string
  originCountry?: string
  destinationCountry?: string
  documentsLink?: string
  estimatedValue?: number | null
  commission?: number | null
}

interface TechDetailsBody {
  packageId?: number | string | null
  packageNameLocal?: string
  estimatedValue?: number | null
  commission?: number | null
}

interface OpportunityBody {
  id: string
  timestamp: string
  referrerName: string
  division: 'technology' | 'trade' | 'both'
  contactName: string
  businessName: string
  phone: string
  email: string
  status: string
  trade: TradeDetailsBody | null
  tech: TechDetailsBody | null
  notes?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Separate sheet from GOOGLE_SHEET_ID on purpose — Trade/Combined data
  // must never land in the existing Technology sales log. Same service
  // account as registrar-venta.ts (already has whatever Sheets access it
  // needs); only the target spreadsheet differs.
  const sheetId = process.env.OPPORTUNITIES_SHEET_ID?.trim()
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim()

  if (!sheetId) {
    res.status(500).json({
      error:
        'Opportunities sync is not configured: set OPPORTUNITIES_SHEET_ID in the Vercel project (separate from GOOGLE_SHEET_ID, which is the existing Technology sales sheet).',
    })
    return
  }
  if (!clientEmail || !privateKey) {
    res.status(500).json({ error: 'Sheets sync is not configured (missing GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY)' })
    return
  }

  const opp = req.body as OpportunityBody
  if (!opp?.businessName || !opp?.contactName || !opp?.referrerName || !opp?.division) {
    res.status(400).json({ error: 'Missing required opportunity fields' })
    return
  }

  // Basic format checks mirroring registrar-venta.ts — not strict, just
  // enough to catch empty or obviously malformed entries.
  const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!opp?.phone || !PHONE_PATTERN.test(opp.phone.replace(/[\s\-().]/g, ''))) {
    res.status(400).json({ error: 'Missing or invalid phone number' })
    return
  }
  if (!opp?.email || !EMAIL_PATTERN.test(opp.email)) {
    res.status(400).json({ error: 'Missing or invalid email address' })
    return
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })

    // New sheet — header row (26 columns, A–Z) needs to be created manually
    // to match this exact order:
    // Date | Division | Status | Referrer | Contact Name | Business Name |
    // Phone | Email | Trade Role | Trade Country | Trade Location |
    // Trade Flow | Trade Category | Trade Product | Trade Quantity |
    // Trade Unit | Trade Recurrence | Trade Origin Country |
    // Trade Destination Country | Trade Documents Link | Trade Est Value |
    // Trade Commission | Tech Package | Tech Est Value | Tech Commission |
    // Notes
    const trade = opp.trade
    const tech = opp.tech

    const row = [
      opp.timestamp,
      opp.division,
      opp.status,
      opp.referrerName,
      opp.contactName,
      opp.businessName,
      // Leading apostrophe forces Sheets to store this as literal text —
      // without it, a leading "+" reads as a numeric/formula hint and gets
      // silently dropped, destroying the country code (see registrar-venta.ts).
      `'${opp.phone}`,
      opp.email,
      trade?.role ?? '',
      trade?.country ?? '',
      trade?.location ?? '',
      trade?.flow ?? '',
      trade?.category ?? '',
      trade?.product ?? '',
      trade?.quantity ?? '',
      trade?.unit ?? '',
      trade?.recurrence ?? '',
      trade?.originCountry ?? '',
      trade?.destinationCountry ?? '',
      trade?.documentsLink ?? '',
      trade?.estimatedValue ?? '',
      trade?.commission ?? '',
      tech?.packageNameLocal ?? '',
      tech?.estimatedValue ?? '',
      tech?.commission ?? '',
      opp.notes ?? '',
    ]

    console.log('registrar-oportunidad request body', JSON.stringify(opp))
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
    console.error('Opportunities sync failed', err)
    res.status(502).json({ error: 'Opportunities sync failed' })
  }
}
