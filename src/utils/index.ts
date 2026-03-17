import { Trade, TradeStatus } from '@/types'

// ── Calc helpers (used in TradeStore) ──────────────────────────

export function calcPnL(trade: Partial<Trade>): number {
  return trade.profitLoss ?? 0
}

export function calcPips(trade: Partial<Trade>): number {
  return trade.pips ?? 0
}

export function calcRR(trade: Partial<Trade>): number {
  return trade.riskReward ?? 0
}

export function tradeStatus(trade: Partial<Trade>): string {
  const map: Record<TradeStatus, string> = {
    WIN:       'Win',
    LOSS:      'Loss',
    BREAKEVEN: 'Breakeven',
    OPEN:      'Open',
  }
  return map[trade.status as TradeStatus] ?? (trade.status ?? '')
}

// ── Formatting ─────────────────────────────────────────────────

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

// ── Derived stats ──────────────────────────────────────────────

export function winRate(trades: Trade[]): number {
  if (!trades.length) return 0
  const wins = trades.filter(t => t.status === 'WIN').length
  return (wins / trades.length) * 100
}

export function profitFactor(trades: Trade[]): number {
  const grossProfit = trades
    .filter(t => t.profitLoss > 0)
    .reduce((s, t) => s + t.profitLoss, 0)
  const grossLoss = Math.abs(
    trades.filter(t => t.profitLoss < 0).reduce((s, t) => s + t.profitLoss, 0)
  )
  return grossLoss === 0 ? grossProfit : grossProfit / grossLoss
}

export function avgRR(trades: Trade[]): number {
  const closed = trades.filter(t => t.status !== 'OPEN')
  if (!closed.length) return 0
  return closed.reduce((s, t) => s + t.riskReward, 0) / closed.length
}

export function maxDrawdown(trades: Trade[]): number {
  let peak = 0
  let equity = 0
  let dd = 0
  const sorted = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  for (const t of sorted) {
    equity += t.profitLoss
    if (equity > peak) peak = equity
    const cur = peak - equity
    if (cur > dd) dd = cur
  }
  return dd
}
