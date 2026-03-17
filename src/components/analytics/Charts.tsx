'use client'

import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, AreaChart, Area,
} from 'recharts'
import { Trade, TradeStrategy, TradeStatus, TradeSession } from '@/types'

// ── Shared styles ─────────────────────────────────────────────

const TT_STYLE = {
  contentStyle: {
    background: '#0f1117',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#fff', fontSize: 12,
  },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
}
const AXIS = { fill: 'rgba(255,255,255,0.3)', fontSize: 11 }
const GRID = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

const STATUS_COLOR: Record<TradeStatus, string> = {
  WIN: '#34d399', LOSS: '#f87171', BREAKEVEN: '#fbbf24', OPEN: '#60a5fa',
}

// ── WinRateByPair ─────────────────────────────────────────────

export function WinRateByPair({ trades }: { trades: Trade[] }) {
  const data = useMemo(() => {
    const map: Record<string, { wins: number; total: number }> = {}
    trades.forEach(t => {
      if (!map[t.pair]) map[t.pair] = { wins: 0, total: 0 }
      map[t.pair].total++
      if (t.status === 'WIN') map[t.pair].wins++
    })
    return Object.entries(map)
      .map(([pair, v]) => ({ pair, winRate: +((v.wins / v.total) * 100).toFixed(1) }))
      .sort((a, b) => b.winRate - a.winRate)
  }, [trades])

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        {GRID}
        <XAxis dataKey="pair" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={40} domain={[0, 100]} tickFormatter={v => `${v}%`} />
        <Tooltip {...TT_STYLE} formatter={(v: any) => [`${v}%`, 'Win Rate']} />
        <Bar dataKey="winRate" fill="#D4AA50" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── ProfitBySession ───────────────────────────────────────────

export function ProfitBySession({ trades }: { trades: Trade[] }) {
  const data = useMemo(() => {
    const map: Partial<Record<TradeSession, number>> = {}
    trades.forEach(t => {
      if (t.session) map[t.session] = (map[t.session] ?? 0) + t.profitLoss
    })
    return Object.entries(map).map(([session, pnl]) => ({
      session, pnl: +(pnl as number).toFixed(2),
    }))
  }, [trades])

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        {GRID}
        <XAxis dataKey="session" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={45} />
        <Tooltip {...TT_STYLE} formatter={(v: any) => [`$${v}`, 'P&L']} />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#34d399' : '#f87171'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── StrategyPerformance ───────────────────────────────────────

export function StrategyPerformance({ trades }: { trades: Trade[] }) {
  const data = useMemo(() => {
    const map: Partial<Record<TradeStrategy, { wins: number; total: number; pnl: number }>> = {}
    trades.forEach(t => {
      if (!t.strategy) return
      if (!map[t.strategy]) map[t.strategy] = { wins: 0, total: 0, pnl: 0 }
      map[t.strategy]!.total++
      map[t.strategy]!.pnl += t.profitLoss
      if (t.status === 'WIN') map[t.strategy]!.wins++
    })
    return Object.entries(map).map(([strategy, v]) => ({
      strategy,
      winRate: +((v!.wins / v!.total) * 100).toFixed(1),
      pnl: +v!.pnl.toFixed(2),
    }))
  }, [trades])

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        {GRID}
        <XAxis type="number" domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
        <YAxis type="category" dataKey="strategy" tick={AXIS} axisLine={false} tickLine={false} width={72} />
        <Tooltip {...TT_STYLE} formatter={(v: any) => [`${v}%`, 'Win Rate']} />
        <Bar dataKey="winRate" fill="#D4AA50" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── MoodPerformance ───────────────────────────────────────────

export function MoodPerformance({ trades }: { trades: Trade[] }) {
  const data = useMemo(() => {
    const map: Record<number, { total: number; count: number }> = {}
    trades.forEach(t => {
      const m = t.mood ?? 5
      if (!map[m]) map[m] = { total: 0, count: 0 }
      map[m].total += t.profitLoss
      map[m].count++
    })
    return Object.entries(map)
      .map(([mood, v]) => ({ mood: `${mood}/10`, avgPnL: +(v.total / v.count).toFixed(2) }))
      .sort((a, b) => a.mood.localeCompare(b.mood))
  }, [trades])

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        {GRID}
        <XAxis dataKey="mood" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={45} />
        <Tooltip {...TT_STYLE} formatter={(v: any) => [`$${v}`, 'Avg P&L']} />
        <Bar dataKey="avgPnL" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.avgPnL >= 0 ? '#34d399' : '#f87171'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── PnLOverTime ───────────────────────────────────────────────

export function PnLOverTime({ trades, initialBalance = 10000 }: { trades: Trade[]; initialBalance?: number }) {
  const data = useMemo(() => {
    const sorted = [...trades]
      .filter(t => t.status !== 'OPEN')
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    let equity = initialBalance
    return [
      { label: 'Start', equity: initialBalance, pnl: 0 },
      ...sorted.map((t, i) => {
        equity += t.profitLoss
        const label = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return { label, equity: +equity.toFixed(2), pnl: t.profitLoss }
      }),
    ]
  }, [trades, initialBalance])

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AA50" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#D4AA50" stopOpacity={0} />
          </linearGradient>
        </defs>
        {GRID}
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={52} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
        <Tooltip {...TT_STYLE} formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Equity']} />
        <Area type="monotone" dataKey="equity" stroke="#D4AA50" strokeWidth={2} fill="url(#equityGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── WinLossPie (bonus, kept for reuse) ───────────────────────

export function WinLossPie({ trades }: { trades: Trade[] }) {
  const data = useMemo(() => {
    const map: Partial<Record<TradeStatus, number>> = {}
    trades.forEach(t => { map[t.status] = (map[t.status] ?? 0) + 1 })
    return (Object.entries(map) as [TradeStatus, number][])
      .map(([status, value]) => ({ name: status, value, color: STATUS_COLOR[status] }))
  }, [trades])

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Legend iconType="circle" iconSize={8}
          formatter={v => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{v}</span>} />
        <Tooltip {...TT_STYLE} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Default export (all charts grid) ─────────────────────────

export default function Charts({ trades }: { trades: Trade[] }) {
  if (!trades.length) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        No trade data to chart yet
      </div>
    )
  }

  function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0f1117] p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-4">{title}</h3>
        {children}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="P&L Over Time"><PnLOverTime trades={trades} /></Card>
      <Card title="Win Rate by Pair"><WinRateByPair trades={trades} /></Card>
      <Card title="Win / Loss Split"><WinLossPie trades={trades} /></Card>
      <Card title="Profit by Session"><ProfitBySession trades={trades} /></Card>
      <Card title="Strategy Performance"><StrategyPerformance trades={trades} /></Card>
      <Card title="Mood vs P&L"><MoodPerformance trades={trades} /></Card>
    </div>
  )
}
