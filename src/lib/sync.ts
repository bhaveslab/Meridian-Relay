import type { Sale } from '../types'
import { markSaleSynced } from './storage'

export async function syncSale(sale: Sale): Promise<boolean> {
  try {
    const res = await fetch('/api/registrar-venta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    })
    if (!res.ok) return false
    markSaleSynced(sale.id)
    return true
  } catch {
    return false
  }
}

export async function syncPendingSales(sales: Sale[]): Promise<void> {
  const pending = sales.filter((s) => !s.synced)
  for (const sale of pending) {
    await syncSale(sale)
  }
}
