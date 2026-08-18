import type { Opportunity } from '../types'

const KEY = 'relay-opportunities'

export function getOpportunities(): Opportunity[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Opportunity[]
  } catch {
    return []
  }
}

export function saveOpportunities(opportunities: Opportunity[]) {
  localStorage.setItem(KEY, JSON.stringify(opportunities))
}

export function addOpportunity(opportunity: Opportunity) {
  const opportunities = getOpportunities()
  opportunities.unshift(opportunity)
  saveOpportunities(opportunities)
}

export function markOpportunitySynced(id: string) {
  const opportunities = getOpportunities().map((o) => (o.id === id ? { ...o, synced: true } : o))
  saveOpportunities(opportunities)
}
