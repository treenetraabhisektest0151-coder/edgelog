'use client'
import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { EquityPoint } from '@/types'

interface Props {
  data:         EquityPoint[]
  startBalance: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as EquityPoint
  return (
    <div className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white/40 mb-1">{d.label}</p>
      <p className="text-white font-semibold">
        Equity: <span className="text-[#D4AA50]">
          ${d.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </p>
      {d.drawdown > 0 && (
        <p className="text-red-400">DD: -{d.drawdown.toFixed(2)}%</p>
      )}
    </div>
  )
}

export default function EquityCurveChart({ data, startBalance }: Props) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        No trade data yet
      </div>
    )
  }

  const equities  = data.map(d => d.equity)
  const minEquity = Math.min(...equities)
  const maxEquity = Math.max(...equities)
  const padding   = (maxEquity - minEquity) * 0.1 || 500

  const isProfit = data[data.length - 1].equity >= startBalance

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={isProfit ? '#34d399' : '#f87171'} stopOpacity={0.25} />
            <stop offset="100%" stopColor={isProfit ? '#34d399' : '#f87171'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="label"
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
        <ReferenceLine y={startBalance} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
        <Area
          type="monotone" dataKey="equity"
          stroke={isProfit ? '#34d399' : '#f87171'}
          strokeWidth={2} fill="url(#curveGrad)"
          dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
