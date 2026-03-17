'use client'
import { useState, useMemo } from 'react'
import { useStore }  from '@/context/TradeStore'
import { FOREX_PAIRS } from '@/lib/constants'
import { Images, Filter, ZoomIn } from 'lucide-react'

type ImgType = 'all' | 'before' | 'after' | 'markup'

interface GalleryItem {
  tradeId: string
  pair:    string
  date:    string
  type:    'before' | 'after' | 'markup'
  url:     string
  pnl:     number
  status:  string
}

export default function GalleryPage() {
  const { trades }      = useStore()
  const [filter, setFilter]   = useState<ImgType>('all')
  const [pair,   setPair]     = useState('')
  const [light,  setLight]    = useState<GalleryItem | null>(null)

  const items = useMemo<GalleryItem[]>(() => {
    const out: GalleryItem[] = []
    for (const t of trades) {
      if (pair && t.pair !== pair) continue
      const add = (type: 'before' | 'after' | 'markup', url?: string) => {
        if (url) out.push({ tradeId: t.id, pair: t.pair, date: t.date, type, url, pnl: t.profitLoss, status: t.status })
      }
      if (filter === 'all' || filter === 'before') add('before', t.beforeImage)
      if (filter === 'all' || filter === 'after')  add('after',  t.afterImage)
      if (filter === 'all' || filter === 'markup') add('markup', t.markupImage)
    }
    return out.sort((a, b) => b.date.localeCompare(a.date))
  }, [trades, filter, pair])

  const TYPE_LABELS = { before: 'Before', after: 'After', markup: 'Markup' }
  const TYPE_COLORS: Record<string,string> = {
    before: 'text-blue-400 bg-blue-400/12 border-blue-400/25',
    after:  'text-emerald-400 bg-emerald-400/12 border-emerald-400/25',
    markup: 'text-gold-400 bg-gold-400/12 border-gold-500/25',
  }

  return (
    <div className="page space-y-5">

      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Images size={22} className="text-gold-400" />
          Screenshot Gallery
        </h1>
        <p className="text-muted text-sm mt-0.5">{items.length} image{items.length !== 1 ? 's' : ''} in view</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3 animate-fade-up d1">
        <Filter size={14} className="text-muted" />

        {/* Type tabs */}
        <div className="flex bg-white/[0.04] rounded-lg p-1 gap-1">
          {(['all','before','after','markup'] as ImgType[]).map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === t
                  ? 'bg-gold-500 text-black'
                  : 'text-muted hover:text-white/70'
              }`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <select className="el !w-auto !py-1.5 !text-xs"
          value={pair} onChange={e => setPair(e.target.value)}>
          <option value="">All pairs</option>
          {FOREX_PAIRS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="card p-16 text-center animate-fade-up d2">
          <Images size={36} className="mx-auto mb-3 text-muted/40" />
          <p className="text-muted text-sm">No screenshots found.</p>
          <p className="text-muted/60 text-xs mt-1">Upload images when logging trades to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 animate-fade-up d2">
          {items.map((item, idx) => (
            <div key={`${item.tradeId}-${item.type}`}
              className="card overflow-hidden cursor-pointer group"
              onClick={() => setLight(item)}>
              {/* Image */}
              <div className="relative" style={{ aspectRatio: '16/10' }}>
                <img
                  src={item.url} alt={`${item.pair} ${item.type}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <ZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  <span className={`badge text-[10px] ${
                    item.status === 'WIN'       ? 'badge-win'  :
                    item.status === 'LOSS'      ? 'badge-loss' :
                    item.status === 'BREAKEVEN' ? 'badge-be'   : 'badge-open'
                  }`}>{item.status}</span>
                </div>
              </div>
              {/* Meta */}
              <div className="px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{item.pair}</span>
                  <span className={`badge border text-[10px] ${TYPE_COLORS[item.type]}`}>
                    {TYPE_LABELS[item.type]}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-muted font-mono">{item.date}</span>
                  <span className={`text-[11px] font-mono font-semibold ${
                    item.pnl > 0 ? 'text-emerald-400' : item.pnl < 0 ? 'text-red-400' : 'text-gold-400'
                  }`}>
                    {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {light && (
        <div className="overlay" onClick={() => setLight(null)}>
          <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold">{light.pair}</span>
                <span className={`badge border text-[10px] ${TYPE_COLORS[light.type]}`}>
                  {TYPE_LABELS[light.type]}
                </span>
                <span className="text-muted text-xs font-mono">{light.date}</span>
              </div>
              <button onClick={() => setLight(null)}
                className="text-muted hover:text-white transition-colors text-2xl leading-none">×</button>
            </div>
            <img
              src={light.url}
              alt={`${light.pair} ${light.type}`}
              className="w-full rounded-xl border border-white/12 max-h-[78vh] object-contain"
            />
            {/* Nav arrows if multiple */}
            <div className="flex justify-center gap-3 mt-3">
              {items.map((item, idx) => (
                <button key={idx}
                  onClick={() => setLight(item)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    item === light ? 'bg-gold-500' : 'bg-white/20 hover:bg-white/40'
                  }`} />
              )).slice(0, 20)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
