import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from 'googleapis'

interface SaleBody {
  id: string
  timestamp: string
  referrerName: string
  market: 'ca' | 'us'
  packageId: number
  packageNameEn: string
  packageNameLocal: string
  businessName: string
  contactInfo?: string
  price: number
  comision: number
  paymentMethod: string
  notes?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const sheetId = process.env.GOOGLE_SHEET_ID
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

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

    // Package name always logs in English (sale.packageNameEn, sourced from
    // packages-*.json name.en) so the sheet stays consistent regardless of
    // which language the referrer had the UI in — see build spec §4.
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            sale.timestamp,
            sale.referrerName,
            sale.market,
            sale.packageId,
            sale.packageNameEn,
            sale.businessName,
            sale.contactInfo ?? '',
            sale.price,
            sale.comision,
            sale.paymentMethod,
            sale.notes ?? '',
          ],
        ],
      },
    })

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Sheets sync failed', err)
    res.status(502).json({ error: 'Sheets sync failed' })
  }
}
