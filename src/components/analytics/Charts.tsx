'use client'

import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Trade, TradeStrategy, TradeStatus, TradeSession } from '@/types'

interface Props { trades: Trade[] }

const TT = {
  contentStyle: {
    background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#fff', fontSize: 12,
  },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
}

const AXIS = { fill: 'rgba(255,255,255,0.3)', fontSize: 11 }

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1117] p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-4">{title}</h3>
      {children}
    </div>
  )
}

// ── PnL by Pair ───────────────────────────────────────────────

function PnLByPair({ trades }: Props) {
  const data = useMemo(() => {
    const map: Record<string, number> = {}
    trades.forEach(t => { map[t.pair] = (map[t.pair] ?? 0) + t.profitLoss })
    return Object.entries(map)
      .map(([pair, pnl]) => ({ pair, pnl: +pnl.toFixed(2) }))
      .sort((a, b) => b.pnl - a.pnl)
  }, [trades])

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="pair" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={45} />
        <Tooltip {...TT} formatter={(v: any) => [`$${v}`, 'PnL']} />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#34d399' : '#f87171'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Win/Loss Pie ──────────────────────────────────────────────

const STATUS_COLOR: Record<TradeStatus, string> = {
  WIN: '#34d399', LOSS: '#f87171', BREAKEVEN: '#fbbf24', OPEN: '#60a5fa',
}

function WinLossPie({ trades }: Props) {
  const data = useMemo(() => {
    const map: Partial<Record<TradeStatus, number>> = {}
    trades.forEach(t => { map[t.status] = (map[t.status] ?? 0) + 1 })
    return (Object.entries(map) as [TradeStatus, number][])
      .map(([status, value]) => ({ name: status, value, color: STATUS_COLOR[status] }))
  }, [trades])

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Legend iconType="circle" iconSize={8}
          formatter={v => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{v}</span>} />
        <Tooltip {...TT} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── PnL by Session ────────────────────────────────────────────

function PnLBySession({ trades }: Props) {
  const data = useMemo(() => {
    const map: Partial<Record<TradeSession, number>> = {}
    trades.forEach(t => { if (t.session) map[t.session] = (map[t.session] ?? 0) + t.profitLoss })
    return Object.entries(map).map(([session, pnl]) => ({ session, pnl: +(pnl as number).toFixed(2) }))
  }, [trades])

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="session" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={45} />
        <Tooltip {...TT} formatter={(v: any) => [`$${v}`, 'PnL']} />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#D4AA50' : '#f87171'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Strategy Win Rate ─────────────────────────────────────────

function StrategyWinRate({ trades }: Props) {
  const data = useMemo(() => {
    const map: Partial<Record<TradeStrategy, { wins: number; total: number }>> = {}
    trades.forEach(t => {
      if (!t.strategy) return
      if (!map[t.strategy]) map[t.strategy] = { wins: 0, total: 0 }
      map[t.strategy]!.total++
      if (t.status === 'WIN') map[t.strategy]!.wins++
    })
    return Object.entries(map).map(([strategy, v]) => ({
      strategy,
      winRate: +((v!.wins / v!.total) * 100).toFixed(1),
    }))
  }, [trades])

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false}
          tickFormatter={v => `${v}%`} />
        <YAxis type="category" dataKey="strategy" tick={AXIS} axisLine={false} tickLine={false} width={72} />
        <Tooltip {...TT} formatter={(v: any) => [`${v}%`, 'Win Rate']} />
        <Bar dataKey="winRate" fill="#D4AA50" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Mood vs PnL scatter (simplified as bar avg) ───────────────

function MoodChart({ trades }: Props) {
  const data = useMemo(() => {
    const map: Record<number, { total: number; count: number }> = {}
    trades.forEach(t => {
      const m = t.mood ?? 5
      if (!map[m]) map[m] = { total: 0, count: 0 }
      map[m].total += t.profitLoss
      map[m].count++
    })
    return Object.entries(map)
      .map(([mood, v]) => ({ mood: `Mood ${mood}`, avgPnL: +(v.total / v.count).toFixed(2) }))
      .sort((a, b) => a.mood.localeCompare(b.mood))
  }, [trades])

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="mood" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={45} />
        <Tooltip {...TT} formatter={(v: any) => [`$${v}`, 'Avg PnL']} />
        <Bar dataKey="avgPnL" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.avgPnL >= 0 ? '#34d399' : '#f87171'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Main ──────────────────────────────────────────────────────

export default function Charts({ trades }: Props) {
  if (!trades.length) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        No trade data to chart yet
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="P&L by Pair"><PnLByPair trades={trades} /></Card>
      <Card title="Win / Loss Distribution"><WinLossPie trades={trades} /></Card>
      <Card title="P&L by Session"><PnLBySession trades={trades} /></Card>
      <Card title="Strategy Win Rate (%)"><StrategyWinRate trades={trades} /></Card>
      <Card title="Mood vs Avg P&L"><MoodChart trades={trades} /></Card>
    </div>
  )
}
