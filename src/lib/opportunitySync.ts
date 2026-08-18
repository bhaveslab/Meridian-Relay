import type { Opportunity } from '../types'
import { markOpportunitySynced } from './opportunityStorage'

export async function syncOpportunity(opportunity: Opportunity): Promise<boolean> {
  try {
    const res = await fetch('/api/registrar-oportunidad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opportunity),
    })
    if (!res.ok) return false
    markOpportunitySynced(opportunity.id)
    return true
  } catch {
    return false
  }
}

export async function syncPendingOpportunities(opportunities: Opportunity[]): Promise<void> {
  const pending = opportunities.filter((o) => !o.synced)
  for (const opportunity of pending) {
    await syncOpportunity(opportunity)
  }
}
