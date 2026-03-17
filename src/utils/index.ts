import { Trade, TradeStatus, AccountStats, EquityPoint, DayStats } from '@/types'

// ── Class name helper ──────────────────────────────────────────
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ── Calc helpers (TradeStore) ──────────────────────────────────

export function calcPnL(trade: Partial<Trade>): number {
  const raw = trade.profitLoss ?? 0
  // ✅ FIX: auto-correct sign based on status
  if (trade.status === 'LOSS' && raw > 0) return -raw
  if (trade.status === 'WIN'  && raw < 0) return -raw
  return raw
}

export function calcPips(trade: Partial<Trade>): number {
  return trade.pips ?? 0
}

export function calcRR(trade: Partial<Trade>): number {
  return trade.riskReward ?? 0
}

export function tradeStatus(trade: Partial<Trade>): string {
  const map: Record<TradeStatus, string> = {
    WIN: 'Win', LOSS: 'Loss', BREAKEVEN: 'Breakeven', OPEN: 'Open',
  }
  return map[trade.status as TradeStatus] ?? (trade.status ?? '')
}

// ── Formatters ─────────────────────────────────────────────────

export function fmtCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, minimumFractionDigits: 2,
  }).format(value)
}

/** @deprecated use fmtCurrency */
export const formatCurrency = fmtCurrency

export function fmtPnL(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

export function fmtPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

/** @deprecated use fmtPct */
export const formatPct = fmtPct

// ── buildStats ─────────────────────────────────────────────────

export function buildStats(trades: Trade[], startingBalance = 10000): AccountStats {
  const closed = trades.filter(t => t.status !== 'OPEN')
  const wins   = closed.filter(t => t.status === 'WIN')
  const losses = closed.filter(t => t.status === 'LOSS')

  const totalPnL = closed.reduce((s, t) => s + t.profitLoss, 0)

  const today    = new Date().toISOString().split('T')[0]
  const weekAgo  = new Date(Date.now() - 7  * 86400000).toISOString().split('T')[0]
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  const todayPnL = trades.filter(t => t.date === today).reduce((s, t) => s + t.profitLoss, 0)
  const weekPnL  = trades.filter(t => t.date >= weekAgo).reduce((s, t) => s + t.profitLoss, 0)
  const monthPnL = trades.filter(t => t.date >= monthAgo).reduce((s, t) => s + t.profitLoss, 0)

  const grossProfit = wins.reduce((s, t) => s + t.profitLoss, 0)
  const grossLoss   = Math.abs(losses.reduce((s, t) => s + t.profitLoss, 0))

  const avgRRVal = closed.length
    ? closed.reduce((s, t) => s + t.riskReward, 0) / closed.length
    : 0

  // max drawdown
  let peak = startingBalance, equity = startingBalance, maxDD = 0
  const sorted = [...closed].sort((a, b) => a.date.localeCompare(b.date))
  for (const t of sorted) {
    equity += t.profitLoss
    if (equity > peak) peak = equity
    const dd = peak - equity
    if (dd > maxDD) maxDD = dd
  }

  // streak
  let streak = 0
  const rev = [...closed].reverse()
  if (rev.length) {
    const dir = rev[0].status === 'WIN' ? 'WIN' : 'LOSS'
    for (const t of rev) {
      if (t.status === dir) streak++
      else break
    }
    if (dir === 'LOSS') streak = -streak
  }

  return {
    balance:       startingBalance + totalPnL,
    totalPnL,
    todayPnL,
    weekPnL,
    monthPnL,
    totalTrades:   trades.length,
    wins:          wins.length,
    losses:        losses.length,
    winRate:       closed.length ? (wins.length / closed.length) * 100 : 0,
    avgRR:         avgRRVal,
    profitFactor:  grossLoss === 0 ? grossProfit : grossProfit / grossLoss,
    maxDrawdown:   maxDD,
    bestTrade:     closed.length ? Math.max(...closed.map(t => t.profitLoss)) : 0,
    worstTrade:    closed.length ? Math.min(...closed.map(t => t.profitLoss)) : 0,
    currentStreak: streak,
  }
}

// ── buildEquityCurve ───────────────────────────────────────────

export function buildEquityCurve(trades: Trade[], startingBalance = 10000): EquityPoint[] {
  const sorted = [...trades]
    .filter(t => t.status !== 'OPEN')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  let equity = startingBalance
  let peak   = startingBalance
  const curve: EquityPoint[] = [{ label: 'Start', equity: startingBalance, drawdown: 0 }]

  for (const t of sorted) {
    equity += t.profitLoss
    if (equity > peak) peak = equity
    const drawdown = peak > 0 ? ((peak - equity) / peak) * 100 : 0
    const label = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    curve.push({ label, equity, drawdown })
  }
  return curve
}

// ── buildCalendar ──────────────────────────────────────────────

export function buildCalendar(trades: Trade[]): Record<string, DayStats> {
  const result: Record<string, DayStats> = {}

  for (const t of trades) {
    if (!t.date) continue
    if (!result[t.date]) {
      result[t.date] = { date: t.date, pnl: 0, trades: 0, wins: 0, losses: 0 }
    }
    result[t.date].trades++
    result[t.date].pnl += t.profitLoss
    if (t.status === 'WIN')  result[t.date].wins++
    if (t.status === 'LOSS') result[t.date].losses++
  }
  return result
}

// ── Misc ───────────────────────────────────────────────────────

export function winRate(trades: Trade[]): number {
  const closed = trades.filter(t => t.status !== 'OPEN')
  if (!closed.length) return 0
  return (closed.filter(t => t.status === 'WIN').length / closed.length) * 100
}

export function profitFactor(trades: Trade[]): number {
  const gp = trades.filter(t => t.profitLoss > 0).reduce((s, t) => s + t.profitLoss, 0)
  const gl = Math.abs(trades.filter(t => t.profitLoss < 0).reduce((s, t) => s + t.profitLoss, 0))
  return gl === 0 ? gp : gp / gl
}

export function avgRR(trades: Trade[]): number {
  const closed = trades.filter(t => t.status !== 'OPEN')
  if (!closed.length) return 0
  return closed.reduce((s, t) => s + t.riskReward, 0) / closed.length
}

export function maxDrawdown(trades: Trade[]): number {
  let peak = 0, equity = 0, dd = 0
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date))
  for (const t of sorted) {
    equity += t.profitLoss
    if (equity > peak) peak = equity
    const cur = peak - equity
    if (cur > dd) dd = cur
  }
  return dd
}
