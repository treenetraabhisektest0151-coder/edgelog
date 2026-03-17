'use client'

import React, { useState } from 'react'
import { useStore } from '@/context/TradeStore'
import { useAuth } from '@/context/AuthContext'
import {
  TradeDirection, TradeSession, TradeStrategy,
  TradeStatus, MistakeType, TradeTag,
} from '@/types'

interface FormState {
  date: string
  time: string
  pair: string
  session: TradeSession | ''
  direction: TradeDirection | ''
  strategy: TradeStrategy | ''
  status: TradeStatus | ''
  tags: TradeTag[]
  entryPrice: string
  stopLoss: string
  takeProfit: string
  exitPrice: string
  lotSize: string
  riskPercent: string
  accountBalance: string
  profitLoss: string
  riskReward: string
  pips: string
  mood: string
  confidence: string
  fear: string
  discipline: boolean
  mistakeType: MistakeType
  notes: string
  tradedDuringNews: boolean
}

const TODAY = new Date().toISOString().split('T')[0]
const NOW   = new Date().toTimeString().slice(0, 5)

const INITIAL: FormState = {
  date: TODAY, time: NOW, pair: '', session: '', direction: '',
  strategy: '', status: '', tags: [],
  entryPrice: '', stopLoss: '', takeProfit: '', exitPrice: '',
  lotSize: '', riskPercent: '', accountBalance: '',
  profitLoss: '', riskReward: '', pips: '',
  mood: '5', confidence: '5', fear: '5',
  discipline: true, mistakeType: 'None', notes: '',
  tradedDuringNews: false,
}

const PAIRS      = ['XAUUSD','EURUSD','GBPUSD','USDJPY','GBPJPY','AUDUSD','USDCAD','NAS100','US30']
const SESSIONS   = ['Asian','London','New York'] as TradeSession[]
const DIRECTIONS = ['BUY','SELL'] as TradeDirection[]
const STRATEGIES = ['SMC','ICT','Scalping','Breakout','Other'] as TradeStrategy[]
const STATUSES   = ['WIN','LOSS','BREAKEVEN','OPEN'] as TradeStatus[]
const MISTAKES   = ['None','FOMO','Revenge Trading','Early Exit','No Stop Loss'] as MistakeType[]
const ALL_TAGS   = ['#SMC','#ICT','#Scalp','#PerfectSetup','#Mistake'] as TradeTag[]

const STATUS_COLOR: Record<TradeStatus, string> = {
  WIN:       'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  LOSS:      'bg-red-500/20 border-red-500/40 text-red-400',
  BREAKEVEN: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
  OPEN:      'bg-blue-500/20 border-blue-500/40 text-blue-400',
}

interface TradeFormProps { onSuccess?: () => void }

export default function TradeForm({ onSuccess }: TradeFormProps) {
  const { addTrade } = useStore()
  const { user }     = useAuth()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleTag(tag: TradeTag) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  async function handleSubmit() {
    if (!user) return
    if (!form.pair || !form.status || !form.direction) {
      setError('Pair, Direction, and Status are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await addTrade({
        date:             form.date,
        time:             form.time,
        pair:             form.pair,
        session:          form.session as TradeSession,
        direction:        form.direction as TradeDirection,
        strategy:         form.strategy as TradeStrategy,
        status:           form.status as TradeStatus,
        tags:             form.tags,
        entryPrice:       parseFloat(form.entryPrice)    || 0,
        stopLoss:         parseFloat(form.stopLoss)       || 0,
        takeProfit:       parseFloat(form.takeProfit)     || 0,
        exitPrice:        parseFloat(form.exitPrice)      || 0,
        lotSize:          parseFloat(form.lotSize)        || 0,
        riskPercent:      parseFloat(form.riskPercent)    || 0,
        accountBalance:   parseFloat(form.accountBalance) || 0,
        profitLoss:       parseFloat(form.profitLoss)     || 0,
        riskReward:       parseFloat(form.riskReward)     || 0,
        pips:             parseFloat(form.pips)           || 0,
        mood:             parseInt(form.mood)             || 5,
        confidence:       parseInt(form.confidence)       || 5,
        fear:             parseInt(form.fear)             || 5,
        discipline:       form.discipline,
        mistakeType:      form.mistakeType,
        notes:            form.notes,
        tradedDuringNews: form.tradedDuringNews,
      }, user.uid)
      setForm(INITIAL)
      onSuccess?.()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save trade.')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D4AA50]/50 transition-colors'
  const lbl = 'block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1'

  return (
    <div className="space-y-6">

      {/* ── Row 1: Core ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={lbl}>Date</label>
          <input type="date" className={inp} value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Time</label>
          <input type="time" className={inp} value={form.time} onChange={e => set('time', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Pair *</label>
          <select className={inp} value={form.pair} onChange={e => set('pair', e.target.value)}>
            <option value="">Select</option>
            {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Session</label>
          <select className={inp} value={form.session} onChange={e => set('session', e.target.value as TradeSession)}>
            <option value="">Select</option>
            {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Row 2: Direction + Status + Strategy ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className={lbl}>Direction *</label>
          <div className="flex gap-2 mt-1">
            {DIRECTIONS.map(d => (
              <button key={d} type="button" onClick={() => set('direction', d)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${
                  form.direction === d
                    ? d === 'BUY' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/25'
                }`}>
                {d === 'BUY' ? '▲ BUY' : '▼ SELL'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={lbl}>Status *</label>
          <div className="flex gap-1.5 flex-wrap mt-1">
            {STATUSES.map(s => (
              <button key={s} type="button" onClick={() => set('status', s)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${
                  form.status === s ? STATUS_COLOR[s] : 'bg-white/5 border-white/10 text-white/40 hover:border-white/25'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={lbl}>Strategy</label>
          <select className={inp} value={form.strategy} onChange={e => set('strategy', e.target.value as TradeStrategy)}>
            <option value="">Select</option>
            {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Row 3: Prices ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {([['entryPrice','Entry Price'],['exitPrice','Exit Price'],['stopLoss','Stop Loss'],['takeProfit','Take Profit']] as const).map(([key, label]) => (
          <div key={key}>
            <label className={lbl}>{label}</label>
            <input type="number" step="0.00001" className={inp} placeholder="0.00000"
              value={form[key]} onChange={e => set(key, e.target.value)} />
          </div>
        ))}
      </div>

      {/* ── Row 4: Size + Results ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {([['lotSize','Lot Size'],['profitLoss','P&L ($)'],['pips','Pips'],['riskReward','Risk:Reward']] as const).map(([key, label]) => (
          <div key={key}>
            <label className={lbl}>{label}</label>
            <input type="number" step="0.01" className={inp} placeholder="0.00"
              value={form[key]} onChange={e => set(key, e.target.value)} />
          </div>
        ))}
      </div>

      {/* ── Row 5: Psychology ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['mood','confidence','fear'] as const).map(k => (
          <div key={k}>
            <label className={lbl}>{k.charAt(0).toUpperCase() + k.slice(1)} <span className="text-[#D4AA50]">{form[k]}/10</span></label>
            <input type="range" min="1" max="10" className="w-full accent-[#D4AA50]"
              value={form[k]} onChange={e => set(k, e.target.value)} />
          </div>
        ))}
        <div>
          <label className={lbl}>Mistake</label>
          <select className={inp} value={form.mistakeType} onChange={e => set('mistakeType', e.target.value as MistakeType)}>
            {MISTAKES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* ── Tags ── */}
      <div>
        <label className={lbl}>Tags</label>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map(tag => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                form.tags.includes(tag)
                  ? 'bg-[#D4AA50]/20 border-[#D4AA50]/40 text-[#D4AA50]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/25'
              }`}>
              {tag}
            </button>
          ))}
          <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer ml-2">
            <input type="checkbox" className="accent-[#D4AA50]"
              checked={form.discipline} onChange={e => set('discipline', e.target.checked)} />
            Disciplined
          </label>
          <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer">
            <input type="checkbox" className="accent-[#D4AA50]"
              checked={form.tradedDuringNews} onChange={e => set('tradedDuringNews', e.target.checked)} />
            Traded During News
          </label>
        </div>
      </div>

      {/* ── Notes ── */}
      <div>
        <label className={lbl}>Notes / Reflection</label>
        <textarea rows={3} className={`${inp} resize-none`}
          placeholder="What did you do well? What would you change?"
          value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button type="button" onClick={handleSubmit} disabled={loading}
        className="w-full py-3 rounded-xl bg-[#D4AA50] hover:bg-[#c49a40] text-black font-bold text-sm uppercase tracking-widest transition-colors disabled:opacity-50">
        {loading ? 'Saving…' : 'Log Trade'}
      </button>
    </div>
  )
}
