'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { useStore }  from '@/context/TradeStore'
import { useAuth }   from '@/context/AuthContext'
import { buildStats, buildEquityCurve, fmtCurrency, fmtPnL } from '@/utils'
import StatCard  from '@/components/ui/StatCard'
import EquityCurveChart from '@/components/dashboard/EquityCurveChart'
import RecentTrades     from '@/components/dashboard/RecentTrades'
import {
  Target, TrendingUp, TrendingDown, Activity,
  Zap, AlertTriangle, BarChart3, DollarSign,
} from 'lucide-react'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { trades, loading } = useStore()
  const { profile, user }  = useAuth()

  const startBal = profile?.startingBalance ?? 10000
  const stats    = useMemo(() => buildStats(trades, startBal), [trades, startBal])
  const curve    = useMemo(() => buildEquityCurve(trades, startBal), [trades, startBal])

  const pct   = startBal > 0 ? ((stats.totalPnL / startBal) * 100).toFixed(2) : '0.00'
  const isPos = stats.totalPnL >= 0

  const greeting = new Date().getHours() < 12 ? 'Morning'
    : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'

  const firstName = profile?.displayName?.split(' ')[0] ?? 'Trader'

  return (
    <div className="page">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7 animate-fade-up">
        <div>
          <p className="text-muted text-sm font-mono">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          <h1 className="text-2xl font-bold mt-0.5">
            Good {greeting},{' '}
            <span className="gradient-text">{firstName}</span>
          </h1>
        </div>
        <Link href="/journal"
          className="btn btn-gold text-sm self-start sm:self-auto">
          <Zap size={14} /> Log Trade
        </Link>
      </div>

      {/* ── Balance hero ── */}
      <div className="card-gold p-5 mb-5 animate-fade-up d1">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-1">Total Balance</p>
            <p className="text-5xl font-bold font-mono tracking-tight">
              {fmtCurrency(stats.balance)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm font-mono font-semibold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmtPnL(stats.totalPnL)}
              </span>
              <span className={`badge text-[11px] font-mono ${isPos ? 'badge-win' : 'badge-loss'}`}>
                {isPos ? '+' : ''}{pct}%
              </span>
              <span className="text-muted text-xs">all time</span>
            </div>
          </div>
          {/* Period PnL */}
          <div className="sm:ml-auto grid grid-cols-3 gap-5 text-center sm:text-right">
            {[
              { label: 'Today',    val: stats.todayPnL  },
              { label: 'Week',     val: stats.weekPnL   },
              { label: 'Month',    val: stats.monthPnL  },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">{label}</p>
                <p className={`text-sm font-mono font-bold ${val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmtPnL(val)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        <StatCard label="Win Rate"    value={`${stats.winRate}%`}
          sub={`${stats.wins}W / ${stats.losses}L`}
          icon={Target} iconColor="text-emerald-400" delay="d1" />
        <StatCard label="Avg R:R"     value={`1:${stats.avgRR.toFixed(2)}`}
          sub={`PF ${stats.profitFactor.toFixed(2)}`}
          icon={TrendingUp} iconColor="text-gold-400" delay="d2" />
        <StatCard label="Trades"      value={stats.totalTrades}
          sub={`${stats.wins + stats.losses} closed`}
          icon={Activity} iconColor="text-blue-400" delay="d2" />
        <StatCard label="Best Trade"  value={fmtCurrency(stats.bestTrade)}
          icon={TrendingUp}  iconColor="text-emerald-400" delay="d3"
          trend={stats.bestTrade >= 0 ? 'up' : 'down'} />
        <StatCard label="Worst Trade" value={fmtCurrency(stats.worstTrade)}
          icon={TrendingDown} iconColor="text-red-400" delay="d3"
          trend="down" />
        <StatCard label="Max Drawdown" value={`${stats.maxDrawdown.toFixed(1)}%`}
          icon={AlertTriangle} iconColor="text-orange-400" delay="d4" />
      </div>

      {/* ── Equity curve + streak ── */}
      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 card p-5 animate-fade-up d2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Equity Curve</h3>
              <p className="text-muted text-xs mt-0.5">Account balance over time</p>
            </div>
            <span className="text-[11px] font-mono text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/18">
              {curve.length > 1 ? `${curve.length - 1} sessions` : 'No data'}
            </span>
          </div>
          <EquityCurveChart data={curve} startBalance={startBal} />
        </div>

        <div className="card p-5 animate-fade-up d3">
          <h3 className="font-semibold text-white text-sm mb-4">Streak &amp; Summary</h3>

          {/* Streak */}
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-wider text-muted mb-1.5">Current Streak</p>
            <div className={`flex items-end gap-2 ${
              stats.currentStreak > 0 ? 'text-emerald-400' :
              stats.currentStreak < 0 ? 'text-red-400' : 'text-muted'
            }`}>
              {stats.currentStreak > 0 ? <Zap size={18} /> : <AlertTriangle size={18} />}
              <span className="text-3xl font-bold font-mono">{Math.abs(stats.currentStreak)}</span>
              <span className="text-sm pb-0.5">
                {stats.currentStreak > 0 ? 'wins' : stats.currentStreak < 0 ? 'losses' : '—'}
              </span>
            </div>
          </div>

          {/* Summary rows */}
          {[
            { label: 'Starting Balance', val: fmtCurrency(startBal), color: 'text-white' },
            { label: 'Total P&L',        val: fmtPnL(stats.totalPnL),
              color: isPos ? 'text-emerald-400' : 'text-red-400' },
            { label: 'Total Trades',     val: stats.totalTrades, color: 'text-white' },
            { label: 'Profit Factor',    val: stats.profitFactor.toFixed(2), color: 'text-gold-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-white/[0.045] last:border-0">
              <span className="text-xs text-muted">{label}</span>
              <span className={`text-xs font-mono font-semibold ${color}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent trades ── */}
      <div className="card p-5 animate-fade-up d4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white text-sm">Recent Trades</h3>
          <Link href="/journal" className="text-xs text-gold-400 hover:text-gold-300 transition-colors font-mono">
            View all →
          </Link>
        </div>
        {loading
          ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
          : <RecentTrades trades={trades.slice(0, 8)} />
        }
      </div>
    </div>
  )
}
