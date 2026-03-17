'use client'

import React from 'react'
import { Trade, TradeStatus } from '@/types'
import { tradeStatus } from '@/utils'

interface Props { trades: Trade[]; limit?: number }

const STATUS_STYLES: Record<TradeStatus, string> = {
  WIN:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  LOSS:      'bg-red-500/10 text-red-400 border-red-500/20',
  BREAKEVEN: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  OPEN:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

function StatusBadge({ status }: { status: TradeStatus }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLES[status] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
      {tradeStatus({ status: status as any })}
    </span>
  )
}

export default function RecentTrades({ trades, limit = 8 }: Props) {
  const recent = [...trades]
    .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
    .slice(0, limit)

  if (!recent.length) {
    return (
      <div className="flex items-center justify-center h-32 text-white/30 text-sm">
        No trades yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {['Pair', 'Date', 'Direction', 'PnL', 'Pips', 'R:R', 'Status'].map(h => (
              <th key={h} className="text-left pb-2 text-[11px] font-medium uppercase tracking-widest text-white/30 pr-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recent.map((trade, i) => {
            const pnl = trade.profitLoss ?? 0
            const date = trade.date
              ? new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '—'
            return (
              <tr key={trade.id ?? i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 pr-4 font-semibold text-white">{trade.pair}</td>
                <td className="py-2.5 pr-4 text-white/40 text-xs">{date}</td>
                <td className={`py-2.5 pr-4 text-xs font-medium ${trade.direction === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trade.direction === 'BUY' ? '▲ BUY' : '▼ SELL'}
                </td>
                <td className={`py-2.5 pr-4 font-semibold ${pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-red-400' : 'text-white/40'}`}>
                  {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}
                </td>
                <td className="py-2.5 pr-4 text-white/60">{(trade.pips ?? 0).toFixed(1)}</td>
                <td className="py-2.5 pr-4 text-white/60">{(trade.riskReward ?? 0).toFixed(2)}R</td>
                <td className="py-2.5"><StatusBadge status={trade.status} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
