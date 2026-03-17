'use client'
import { useState } from 'react'
import { useStore } from '@/context/TradeStore'
import TradeForm    from '@/components/journal/TradeForm'
import TradeTable   from '@/components/journal/TradeTable'
import TradeFilters from '@/components/journal/TradeFilters'
import Modal        from '@/components/ui/Modal'
import { Plus, BookOpen } from 'lucide-react'

export default function JournalPage() {
  const { filtered, loading } = useStore()
  const [open, setOpen] = useState(false)
  const trades = filtered()

  function exportCSV() {
    const headers = ['Date','Time','Pair','Direction','Session','Strategy',
      'Entry','SL','TP','Exit','Lots','Risk%','P&L','RR','Pips','Status',
      'Mood','Confidence','Fear','Discipline','Mistake','Notes','Tags']
    const rows = trades.map(t => [
      t.date, t.time, t.pair, t.direction, t.session, t.strategy,
      t.entryPrice, t.stopLoss, t.takeProfit, t.exitPrice,
      t.lotSize, t.riskPercent, t.profitLoss, t.riskReward, t.pips, t.status,
      t.mood, t.confidence, t.fear, t.discipline ? 'Yes' : 'No',
      t.mistakeType, `"${(t.notes || '').replace(/"/g,'""')}"`,
      (t.tags || []).join(';'),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `edgelog_trades_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  return (
    <div className="page space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen size={22} className="text-gold-400" />
            Trade Journal
          </h1>
          <p className="text-muted text-sm mt-0.5">
            {trades.length} trade{trades.length !== 1 ? 's' : ''} logged
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="btn btn-gold text-sm">
          <Plus size={15} /> Log Trade
        </button>
      </div>

      {/* Filters */}
      <div className="animate-fade-up d1">
        <TradeFilters />
      </div>

      {/* Table */}
      <div className="card p-5 animate-fade-up d2">
        {loading
          ? <div className="flex justify-center py-14">
              <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          : <TradeTable trades={trades} onExportCSV={exportCSV} />
        }
      </div>

      {/* Log trade modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Log New Trade" maxW="max-w-3xl">
        <TradeForm onClose={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
