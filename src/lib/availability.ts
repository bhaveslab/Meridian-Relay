export interface KickoffAvailability {
  ok: boolean
  capacity: number
  counts: Record<string, number>
}

// Advisory-only — a failed/offline fetch returns ok:false rather than
// throwing, so callers can show "can't verify" instead of blocking the
// date picker. Never treat this as a hard capacity gate.
export async function fetchKickoffAvailability(): Promise<KickoffAvailability> {
  try {
    const res = await fetch('/api/kickoff-availability')
    if (!res.ok) return { ok: false, capacity: 3, counts: {} }
    return (await res.json()) as KickoffAvailability
  } catch {
    return { ok: false, capacity: 3, counts: {} }
  }
}
