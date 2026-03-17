'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/context/TradeStore'
import {
  WinRateByPair, ProfitBySession,
  StrategyPerformance, MoodPerformance, PnLOverTime,
} from '@/components/analytics/Charts'
import { FOREX_PAIRS, STRATEGIES } from '@/lib/constants'
import { buildStats, fmtCurrency, fmtPnL } from '@/utils'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const { trades }  = useStore()
  const [pair,     setPair]     = useState('')
  const [strategy, setStrategy] = useState('')
  const [from,     setFrom]     = useState('')
  const [to,       setTo]       = useState('')

  const filtered = useMemo(() => trades.filter(t => {
    if (pair     && t.pair     !== pair)     return false
    if (strategy && t.strategy !== strategy as any) return false
    if (from && t.date < from) return false
    if (to   && t.date > to)   return false
    return true
  }), [trades, pair, strategy, from, to])

  const stats = useMemo(() => buildStats(filtered, 0), [filtered])

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card p-5">
      <h3 className="font-semibold text-white text-sm mb-4">{title}</h3>
      {children}
    </div>
  )

  return (
    <div className="page space-y-5">

      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={22} className="text-gold-400" />
          Analytics
        </h1>
        <p className="text-muted text-sm mt-0.5">{filtered.length} trades in view</p>
      </div>

      {/* Filters */}
      <div className="card p-4 animate-fade-up d1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">From</label>
            <input type="date" className="el !text-xs !py-1.5" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">To</label>
            <input type="date" className="el !text-xs !py-1.5" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">Pair</label>
            <select className="el !text-xs !py-1.5" value={pair} onChange={e => setPair(e.target.value)}>
              <option value="">All pairs</option>
              {FOREX_PAIRS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">Strategy</label>
            <select className="el !text-xs !py-1.5" value={strategy} onChange={e => setStrategy(e.target.value)}>
              <option value="">All strategies</option>
              {STRATEGIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up d2">
        {[
          { label: 'Total P&L',    val: fmtPnL(stats.totalPnL),       color: stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Win Rate',     val: `${stats.winRate}%`,           color: 'text-gold-400' },
          { label: 'Avg R:R',      val: `1:${stats.avgRR.toFixed(2)}`, color: 'text-blue-400' },
          { label: 'Profit Factor',val: stats.profitFactor.toFixed(2), color: 'text-emerald-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">{label}</p>
            <p className={`text-xl font-bold font-mono ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="animate-fade-up d2">
          <ChartCard title="Win Rate by Pair">
            <WinRateByPair trades={filtered} />
          </ChartCard>
        </div>
        <div className="animate-fade-up d3">
          <ChartCard title="Profit by Session">
            <ProfitBySession trades={filtered} />
          </ChartCard>
        </div>
        <div className="animate-fade-up d3">
          <ChartCard title="Strategy Performance">
            <StrategyPerformance trades={filtered} />
          </ChartCard>
        </div>
        <div className="animate-fade-up d4">
          <ChartCard title="Mood vs Performance">
            <MoodPerformance trades={filtered} />
          </ChartCard>
        </div>
      </div>

      {/* Full-width PnL line */}
      <div className="animate-fade-up d4">
        <ChartCard title="Cumulative P&L Over Time">
          <PnLOverTime trades={filtered} />
        </ChartCard>
      </div>

      {/* Mistake breakdown */}
      <div className="card p-5 animate-fade-up d5">
        <h3 className="font-semibold text-white text-sm mb-4">Mistake Breakdown</h3>
        <MistakeTable trades={filtered} />
      </div>
    </div>
  )
}

function MistakeTable({ trades }: { trades: any[] }) {
  const map: Record<string, { count: number; pnl: number }> = {}
  for (const t of trades.filter(t => t.mistakeType && t.mistakeType !== 'None')) {
    if (!map[t.mistakeType]) map[t.mistakeType] = { count: 0, pnl: 0 }
    map[t.mistakeType].count++
    map[t.mistakeType].pnl += t.profitLoss
  }
  const rows = Object.entries(map).sort((a,b) => b[1].count - a[1].count)
  if (!rows.length) return (
    <p className="text-muted text-sm text-center py-6">No mistakes recorded 🎯</p>
  )
  return (
    <table className="tbl">
      <thead>
        <tr><th>Mistake</th><th>Count</th><th>Total P&L Impact</th></tr>
      </thead>
      <tbody>
        {rows.map(([type, v]) => (
          <tr key={type}>
            <td className="font-semibold">{type}</td>
            <td className="font-mono text-muted">{v.count}</td>
            <td className={`font-mono font-semibold ${v.pnl >= 0 ? 'status-win' : 'status-loss'}`}>
              {fmtPnL(v.pnl)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
