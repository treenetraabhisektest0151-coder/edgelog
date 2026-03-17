'use client'
import { useState } from 'react'
import { useStore } from '@/context/TradeStore'
import { useAuth }  from '@/context/AuthContext'
import { CURRENCIES, NEWS_TYPES, IMPACT_COLORS } from '@/lib/constants'
import { NewsEvent, NewsImpact, NewsEventType } from '@/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Newspaper, Plus, Trash2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

const DEF_FORM = {
  date:     format(new Date(), 'yyyy-MM-dd'),
  time:     format(new Date(), 'HH:mm'),
  currency: 'USD',
  title:    '',
  impact:   'High' as NewsImpact,
  type:     'NFP'  as NewsEventType,
  notes:    '',
}

export default function NewsPage() {
  const { news, addNews, deleteNews, trades } = useStore()
  const { user }  = useAuth()
  const [form, setForm] = useState({ ...DEF_FORM })
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setBusy(true)
    try {
      await addNews(form, user.uid)
      toast.success('News event saved')
      setForm({ ...DEF_FORM })
    } catch { toast.error('Save failed') }
    finally { setBusy(false) }
  }

  async function del(id: string) {
    try { await deleteNews(id); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
  }

  // Group by date
  const grouped: Record<string, NewsEvent[]> = {}
  for (const n of [...news].sort((a,b) => b.date.localeCompare(a.date))) {
    if (!grouped[n.date]) grouped[n.date] = []
    grouped[n.date].push(n)
  }

  // Count trades linked to each news event
  function linkedTrades(newsId: string) {
    return trades.filter(t => t.newsEventId === newsId || t.tradedDuringNews).length
  }

  return (
    <div className="page space-y-5">

      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper size={22} className="text-gold-400" />
          Forex News
        </h1>
        <p className="text-muted text-sm mt-0.5">Log high-impact news events manually</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card p-5 animate-fade-up d1">
            <h2 className="font-semibold text-sm mb-4">Add News Event</h2>
            <form onSubmit={submit} className="space-y-3">

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="el"
                    value={form.date} onChange={e => set('date', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Time (GMT)</label>
                  <input type="time" className="el"
                    value={form.time} onChange={e => set('time', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Title / Description</label>
                <input type="text" className="el" placeholder="e.g. US Non-Farm Payrolls"
                  value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Currency</label>
                  <select className="el" value={form.currency} onChange={e => set('currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="el" value={form.type} onChange={e => set('type', e.target.value)}>
                    {NEWS_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Impact</label>
                  <select className="el" value={form.impact} onChange={e => set('impact', e.target.value)}>
                    {['Low','Medium','High'].map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Notes (optional)</label>
                <textarea className="el" rows={2} placeholder="Forecast, actual result, notes…"
                  value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>

              <button type="submit" disabled={busy} className="btn btn-gold w-full text-sm">
                {busy
                  ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : <><Plus size={14} /> Add Event</>
                }
              </button>
            </form>
          </div>

          {/* Impact legend */}
          <div className="card p-4 mt-3 animate-fade-up d2">
            <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-3">Impact Guide</p>
            {[
              { level: 'High'   as NewsImpact, desc: 'Major market movers — avoid trading or extra caution' },
              { level: 'Medium' as NewsImpact, desc: 'Can cause volatility — reduce risk' },
              { level: 'Low'    as NewsImpact, desc: 'Minor impact — trade normally' },
            ].map(({ level, desc }) => (
              <div key={level} className="flex gap-3 mb-2 last:mb-0">
                <span className="badge mt-0.5 shrink-0 text-[10px]" style={{
                  background: IMPACT_COLORS[level] + '22',
                  color:      IMPACT_COLORS[level],
                  border:     `1px solid ${IMPACT_COLORS[level]}44`,
                }}>{level}</span>
                <p className="text-xs text-dim">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* News list */}
        <div className="lg:col-span-3 space-y-3 animate-fade-up d2">
          {Object.keys(grouped).length === 0 ? (
            <div className="card p-10 text-center text-muted">
              <Newspaper size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No news events logged yet.</p>
              <p className="text-xs mt-1">Use the form to add economic events.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, events]) => (
              <div key={date} className="card overflow-hidden">
                {/* Date header */}
                <div className="px-4 py-2.5 bg-white/[0.025] border-b border-white/[0.06] flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-gold-400">{date}</span>
                  <span className="text-[10px] text-muted">· {events.length} event{events.length>1?'s':''}</span>
                </div>

                {events.map(ev => {
                  const linked = linkedTrades(ev.id)
                  const open   = expanded === ev.id
                  const impact = ev.impact as NewsImpact
                  return (
                    <div key={ev.id} className="border-b border-white/[0.04] last:border-0">
                      <div
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => setExpanded(open ? null : ev.id)}>

                        {/* Impact dot */}
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{
                          background: IMPACT_COLORS[impact] || '#6b7280',
                          boxShadow:  `0 0 6px ${IMPACT_COLORS[impact]}66`,
                        }} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white truncate">{ev.title}</span>
                            <span className="badge text-[10px]" style={{
                              background: IMPACT_COLORS[impact] + '18',
                              color:      IMPACT_COLORS[impact],
                              border:     `1px solid ${IMPACT_COLORS[impact]}33`,
                            }}>{ev.impact}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-muted font-mono">{ev.time} GMT</span>
                            <span className="text-[11px] text-muted">{ev.currency} · {ev.type}</span>
                            {linked > 0 && (
                              <span className="text-[11px] text-gold-400/80">{linked} trade{linked>1?'s':''} linked</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {open ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                          <button
                            onClick={e => { e.stopPropagation(); del(ev.id) }}
                            className="p-1.5 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded notes */}
                      {open && ev.notes && (
                        <div className="px-4 pb-3">
                          <div className="flex items-start gap-2 bg-white/[0.025] rounded-lg p-3">
                            <AlertCircle size={13} className="text-gold-400/70 mt-0.5 shrink-0" />
                            <p className="text-xs text-dim">{ev.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
