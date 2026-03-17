'use client'
import { useState, useMemo } from 'react'
import { useStore }  from '@/context/TradeStore'
import { buildCalendar, fmtPnL } from '@/utils'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

export default function CalendarPage() {
  const { trades }  = useStore()
  const [current, setCurrent] = useState(new Date())

  const calMap = useMemo(() => buildCalendar(trades), [trades])

  const monthStart = startOfMonth(current)
  const monthEnd   = endOfMonth(current)
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd     = endOfWeek(monthEnd,   { weekStartsOn: 1 })
  const days       = eachDayOfInterval({ start: calStart, end: calEnd })

  const monthKey   = format(current, 'yyyy-MM')
  const monthStats = useMemo(() => {
    const entries = Object.entries(calMap).filter(([d]) => d.startsWith(monthKey))
    return {
      pnl:    entries.reduce((s,[,v]) => s + v.pnl, 0),
      trades: entries.reduce((s,[,v]) => s + v.trades, 0),
      wins:   entries.reduce((s,[,v]) => s + v.wins, 0),
      losses: entries.reduce((s,[,v]) => s + v.losses, 0),
    }
  }, [calMap, monthKey])

  function prev() { setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function next() { setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }

  return (
    <div className="page space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays size={22} className="text-gold-400" />
          P&amp;L Calendar
        </h1>
        {/* Month nav */}
        <div className="flex items-center gap-3">
          <button onClick={prev} className="btn btn-ghost !p-2"><ChevronLeft size={16} /></button>
          <span className="font-semibold text-sm w-28 text-center">
            {format(current, 'MMMM yyyy')}
          </span>
          <button onClick={next} className="btn btn-ghost !p-2"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up d1">
        {[
          { label: 'Month P&L',    val: fmtPnL(monthStats.pnl),   color: monthStats.pnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Total Trades', val: monthStats.trades,         color: 'text-white' },
          { label: 'Wins',         val: monthStats.wins,           color: 'text-emerald-400' },
          { label: 'Losses',       val: monthStats.losses,         color: 'text-red-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">{label}</p>
            <p className={`text-xl font-bold font-mono ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="card p-5 animate-fade-up d2">

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className="text-center text-[11px] uppercase tracking-wider text-muted font-semibold py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map(day => {
            const key      = format(day, 'yyyy-MM-dd')
            const stats    = calMap[key]
            const inMonth  = isSameMonth(day, current)
            const today    = isToday(day)

            let cellClass = 'cal-cell '
            if (!inMonth) cellClass += 'cal-empty'
            else if (!stats) cellClass += 'cal-empty'
            else if (stats.pnl > 0)  cellClass += 'cal-profit'
            else if (stats.pnl < 0)  cellClass += 'cal-loss'
            else cellClass += 'cal-be'
            if (today) cellClass += ' cal-today'

            return (
              <div key={key} className={cellClass}>
                <span className={`text-xs font-semibold ${
                  today ? 'text-gold-400' : inMonth ? 'text-white/80' : 'text-white/20'
                }`}>
                  {format(day, 'd')}
                </span>
                {stats && inMonth && (
                  <>
                    <span className={`text-[10px] font-mono font-bold mt-0.5 ${
                      stats.pnl > 0 ? 'text-emerald-400' :
                      stats.pnl < 0 ? 'text-red-400' : 'text-gold-400'
                    }`}>
                      {stats.pnl >= 0 ? '+' : ''}{stats.pnl.toFixed(0)}
                    </span>
                    <span className="text-[9px] text-muted">{stats.trades}t</span>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/[0.05]">
          {[
            { cls: 'cal-profit', label: 'Profit' },
            { cls: 'cal-loss',   label: 'Loss' },
            { cls: 'cal-be',     label: 'Breakeven' },
            { cls: 'cal-empty',  label: 'No trades' },
          ].map(({ cls, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`cal-cell !min-h-0 !aspect-auto w-4 h-4 !p-0 ${cls}`} />
              <span className="text-xs text-muted">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-gold-500/55" />
            <span className="text-xs text-muted">Today</span>
          </div>
        </div>
      </div>

      {/* This month's trade log */}
      <div className="card p-5 animate-fade-up d3">
        <h3 className="font-semibold text-white text-sm mb-4">
          Trades in {format(current, 'MMMM yyyy')}
        </h3>
        <MonthTradeList trades={trades} monthKey={monthKey} />
      </div>
    </div>
  )
}

function MonthTradeList({ trades, monthKey }: { trades: any[]; monthKey: string }) {
  const list = trades.filter(t => t.date?.startsWith(monthKey) && t.status !== 'OPEN')
    .sort((a,b) => b.date.localeCompare(a.date))

  if (!list.length) return (
    <p className="text-muted text-sm text-center py-6">No closed trades this month</p>
  )

  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead>
          <tr><th>Date</th><th>Pair</th><th>Direction</th><th>Strategy</th><th>P&L</th><th>Status</th></tr>
        </thead>
        <tbody>
          {list.map(t => (
            <tr key={t.id}>
              <td className="font-mono text-muted text-xs">{t.date}</td>
              <td className="font-bold">{t.pair}</td>
              <td className={`text-xs font-semibold ${t.direction === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.direction}
              </td>
              <td className="text-xs text-dim">{t.strategy}</td>
              <td className={`font-mono text-xs font-semibold ${
                t.profitLoss > 0 ? 'status-win' : t.profitLoss < 0 ? 'status-loss' : 'status-be'
              }`}>{fmtPnL(t.profitLoss)}</td>
              <td>
                <span className={`badge text-[10px] ${
                  t.status === 'WIN' ? 'badge-win' : t.status === 'LOSS' ? 'badge-loss' : 'badge-be'
                }`}>{t.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
