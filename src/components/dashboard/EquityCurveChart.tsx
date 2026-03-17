'use client'

import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Trade } from '@/types'

interface Props {
  trades: Trade[]
  initialBalance?: number
}

interface DataPoint { index: number; date: string; equity: number; pnl: number }

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as DataPoint
  return (
    <div className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white/40 mb-1">{d.date}</p>
      <p className="text-white font-semibold">
        Equity: <span className="text-[#D4AA50]">
          ${d.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </p>
      <p className={`font-medium ${d.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        PnL: {d.pnl >= 0 ? '+' : ''}{d.pnl.toFixed(2)}
      </p>
    </div>
  )
}

export default function EquityCurveChart({ trades, initialBalance = 10000 }: Props) {
  const data = useMemo<DataPoint[]>(() => {
    const sorted = [...trades].sort(
      (a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
    )
    let equity = initialBalance
    return sorted.map((trade, i) => {
      const pnl = trade.profitLoss ?? 0
      equity += pnl
      const date = trade.date
        ? new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : `Trade ${i + 1}`
      return { index: i + 1, date, equity, pnl }
    })
  }, [trades, initialBalance])

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        No trade data yet
      </div>
    )
  }

  const minEquity = Math.min(...data.map(d => d.equity), initialBalance)
  const maxEquity = Math.max(...data.map(d => d.equity), initialBalance)
  const padding = (maxEquity - minEquity) * 0.1 || 500

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
          axisLine={false} tickLine={false} interval="preserveStartEnd"
        />
        <YAxis
          domain={[minEquity - padding, maxEquity + padding]}
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
          axisLine={false} tickLine={false}
          tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={initialBalance} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
        <Line
          type="monotone" dataKey="equity" stroke="#D4AA50" strokeWidth={2}
          dot={false} activeDot={{ r: 4, fill: '#D4AA50', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
