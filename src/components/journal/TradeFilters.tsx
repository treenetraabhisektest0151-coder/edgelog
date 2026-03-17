'use client'

import React from 'react'
import { TradeFilters as Filters, TradeStrategy, TradeStatus, TradeTag } from '@/types'

interface Props {
  filters: Filters
  onChange: (f: Partial<Filters>) => void
  onClear: () => void
}

const PAIRS      = ['', 'XAUUSD','EURUSD','GBPUSD','USDJPY','GBPJPY','AUDUSD','USDCAD','NAS100','US30']
const STRATEGIES = ['', 'SMC','ICT','Scalping','Breakout','Other'] as (TradeStrategy | '')[]
const STATUSES   = ['', 'WIN','LOSS','BREAKEVEN','OPEN'] as (TradeStatus | '')[]
const ALL_TAGS   = ['#SMC','#ICT','#Scalp','#PerfectSetup','#Mistake'] as TradeTag[]

export default function TradeFilters({ filters, onChange, onClear }: Props) {
  const inp = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D4AA50]/50 transition-colors'
  const lbl = 'block text-[10px] font-medium text-white/40 uppercase tracking-wider mb-1'

  function toggleTag(tag: TradeTag) {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    onChange({ tags })
  }

  const hasFilters = filters.dateFrom || filters.dateTo || filters.pair ||
    filters.strategy || filters.status || filters.tags.length > 0

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1117] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Filters</span>
        {hasFilters && (
          <button onClick={onClear}
            className="text-[10px] text-[#D4AA50] hover:text-[#c49a40] uppercase tracking-widest transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>From</label>
          <input type="date" className={inp}
            value={filters.dateFrom}
            onChange={e => onChange({ dateFrom: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>To</label>
          <input type="date" className={inp}
            value={filters.dateTo}
            onChange={e => onChange({ dateTo: e.target.value })} />
        </div>
      </div>

      {/* Pair + Strategy + Status */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={lbl}>Pair</label>
          <select className={inp} value={filters.pair} onChange={e => onChange({ pair: e.target.value })}>
            {PAIRS.map(p => <option key={p} value={p}>{p || 'All'}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Strategy</label>
          <select className={inp} value={filters.strategy} onChange={e => onChange({ strategy: e.target.value })}>
            {STRATEGIES.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Status</label>
          <select className={inp} value={filters.status} onChange={e => onChange({ status: e.target.value })}>
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className={lbl}>Tags</label>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map(tag => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                filters.tags.includes(tag)
                  ? 'bg-[#D4AA50]/20 border-[#D4AA50]/40 text-[#D4AA50]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/25'
              }`}>
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
