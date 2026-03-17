'use client'

import React, { useState } from 'react'
import { Trade, TradeStatus, TradeDirection } from '@/types'
interface Props {
  trades: Trade[]
  onEdit?: (trade: Trade) => void
  onDelete?: (id: string) => void
  onExportCSV?: () => void
}

const STATUS_STYLE: Record<TradeStatus, string> = {
  WIN:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  LOSS:      'bg-red-500/10 text-red-400 border-red-500/20',
  BREAKEVEN: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  OPEN:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

type SortKey = 'date' | 'pair' | 'profitLoss' | 'pips' | 'riskReward' | 'status'

export default function TradeTable({ trades, onEdit, onDelete, onExportCSV }: Props) {
  const [sortKey, setSortKey]   = useState<SortKey>('date')
  const [sortAsc, setSortAsc]   = useState(false)
  const [confirm, setConfirm]   = useState<string | null>(null)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(false) }
  }

  const sorted = [...trades].sort((a, b) => {
    let av: any, bv: any
    if (sortKey === 'date') {
      av = new Date(`${a.date} ${a.time}`).getTime()
      bv = new Date(`${b.date} ${b.time}`).getTime()
    } else {
      av = a[sortKey]; bv = b[sortKey]
    }
    if (av < bv) return sortAsc ? -1 : 1
    if (av > bv) return sortAsc ? 1 : -1
    return 0
  })

  function SortTh({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <th
        className="text-left pb-2 pr-4 text-[11px] font-medium uppercase tracking-widest text-white/30 cursor-pointer hover:text-white/60 transition-colors select-none whitespace-nowrap"
        onClick={() => toggleSort(k)}
      >
        {label} {active ? (sortAsc ? '↑' : '↓') : ''}
      </th>
    )
  }

  if (!sorted.length) {
    return (
      <div className="flex items-center justify-center h-32 text-white/30 text-sm">
        No trades found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <SortTh label="Date" k="date" />
            <SortTh label="Pair" k="pair" />
            <th className="text-left pb-2 pr-4 text-[11px] font-medium uppercase tracking-widest text-white/30">Dir</th>
            <th className="text-left pb-2 pr-4 text-[11px] font-medium uppercase tracking-widest text-white/30">Strategy</th>
            <th className="text-left pb-2 pr-4 text-[11px] font-medium uppercase tracking-widest text-white/30">Session</th>
            <SortTh label="P&L" k="profitLoss" />
            <SortTh label="Pips" k="pips" />
            <SortTh label="R:R" k="riskReward" />
            <SortTh label="Status" k="status" />
            <th className="text-left pb-2 text-[11px] font-medium uppercase tracking-widest text-white/30">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((trade, i) => {
            const pnl = trade.profitLoss ?? 0
            const date = trade.date
              ? new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
              : '—'
            return (
              <tr key={trade.id ?? i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                <td className="py-2.5 pr-4 text-white/40 text-xs whitespace-nowrap">
                  {date} <span className="text-white/20">{trade.time}</span>
                </td>
                <td className="py-2.5 pr-4 font-semibold text-white">{trade.pair}</td>
                <td className={`py-2.5 pr-4 text-xs font-bold ${trade.direction === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trade.direction === 'BUY' ? '▲' : '▼'} {trade.direction}
                </td>
                <td className="py-2.5 pr-4 text-white/50 text-xs">{trade.strategy ?? '—'}</td>
                <td className="py-2.5 pr-4 text-white/50 text-xs">{trade.session ?? '—'}</td>
                <td className={`py-2.5 pr-4 font-semibold ${pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-red-400' : 'text-white/40'}`}>
                  {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}
                </td>
                <td className="py-2.5 pr-4 text-white/60">{(trade.pips ?? 0).toFixed(1)}</td>
                <td className="py-2.5 pr-4 text-white/60">{(trade.riskReward ?? 0).toFixed(2)}R</td>
                <td className="py-2.5 pr-4">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLE[trade.status] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
                    {trade.status}
                  </span>
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button onClick={() => onEdit(trade)}
                        className="text-xs text-white/40 hover:text-[#D4AA50] transition-colors">
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      confirm === trade.id ? (
                        <span className="flex gap-1">
                          <button onClick={() => { onDelete(trade.id); setConfirm(null) }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors">
                            Confirm
                          </button>
                          <button onClick={() => setConfirm(null)}
                            className="text-xs text-white/30 hover:text-white/60 transition-colors">
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button onClick={() => setConfirm(trade.id)}
                          className="text-xs text-white/40 hover:text-red-400 transition-colors">
                          Delete
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
