import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from 'googleapis'

// Advisory-only capacity check for kickoff-day scheduling — never a hard
// gate. Referrers (often offline in the field) can always log a sale with
// whatever date they picked; the team resolves any real double-bookings
// manually, the same way "Delivered to Engineer" is already a manual field.
const DAILY_CAPACITY = 3

// Kickoff Date is column L — the sheet's header row is exactly:
// Date | Business | Package | Commission | Payment Type | Trade Details |
// Delivered to Engineer | Referrer | Phone | Email | Notes | Kickoff Date
const KICKOFF_DATE_RANGE = 'Sheet1!L2:L'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const sheetId = process.env.GOOGLE_SHEET_ID?.trim()
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim()

  // Fail open: if Sheets isn't reachable or configured, report "unknown"
  // rather than blocking the picker — capacity is advisory, not a gate.
  if (!sheetId || !clientEmail || !privateKey) {
    res.status(200).json({ ok: false, capacity: DAILY_CAPACITY, counts: {} })
    return
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })
    const sheets = google.sheets({ version: 'v4', auth })

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: KICKOFF_DATE_RANGE,
    })

    const counts: Record<string, number> = {}
    for (const row of result.data.values ?? []) {
      const date = row[0]
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
        counts[date.trim()] = (counts[date.trim()] ?? 0) + 1
      }
    }

    res.status(200).json({ ok: true, capacity: DAILY_CAPACITY, counts })
  } catch (err) {
    console.error('kickoff-availability read failed', err)
    res.status(200).json({ ok: false, capacity: DAILY_CAPACITY, counts: {} })
  }
}
