'use client'
import { useState } from 'react'
import { useAuth }   from '@/context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useStore } from '@/context/TradeStore'
import { buildStats, fmtCurrency } from '@/utils'
import toast from 'react-hot-toast'
import {
  Settings, User, DollarSign, Shield,
  Save, TrendingUp, AlertTriangle,
} from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { trades } = useStore()

  const [name,    setName]    = useState(profile?.displayName || '')
  const [balance, setBalance] = useState(String(profile?.startingBalance || 10000))
  const [currency,setCurrency]= useState(profile?.currency || 'USD')
  const [risk,    setRisk]    = useState(String(profile?.riskPerTrade ?? 1))
  const [broker,  setBroker]  = useState(profile?.broker || '')
  const [busy,    setBusy]    = useState(false)

  const stats = buildStats(trades, profile?.startingBalance || 10000)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setBusy(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName:     name,
        startingBalance: parseFloat(balance) || 10000,
        currency,
        riskPerTrade:    parseFloat(risk) || 1,
        broker,
      })
      await refreshProfile()
      toast.success('Settings saved')
    } catch { toast.error('Save failed') }
    finally { setBusy(false) }
  }

  const Section = ({ title, icon: Icon, children }: {
    title: string; icon: any; children: React.ReactNode
  }) => (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
        <Icon size={16} className="text-gold-400" />
        <h2 className="font-semibold text-sm text-white">{title}</h2>
      </div>
      {children}
    </div>
  )

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )

  return (
    <div className="page space-y-5">

      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings size={22} className="text-gold-400" />
          Settings
        </h1>
        <p className="text-muted text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">

          {/* Profile form */}
          <form onSubmit={save} className="animate-fade-up d1">
            <Section title="Profile & Account" icon={User}>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Display Name">
                  <input className="el" value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your trading name" />
                </Field>
                <Field label="Email (read-only)">
                  <input className="el opacity-50 cursor-not-allowed"
                    value={user?.email || ''} readOnly />
                </Field>
                <Field label="Broker (optional)">
                  <input className="el" value={broker}
                    onChange={e => setBroker(e.target.value)}
                    placeholder="e.g. FTMO, Pepperstone" />
                </Field>
                <Field label="Account Currency">
                  <select className="el" value={currency} onChange={e => setCurrency(e.target.value)}>
                    {['USD','EUR','GBP','JPY','AUD','CAD'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
            </Section>

            <div className="mt-4">
              <Section title="Risk Management" icon={Shield}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Starting / Challenge Balance ($)">
                    <input type="number" className="el" value={balance} min={0} step={0.01}
                      onChange={e => setBalance(e.target.value)} />
                  </Field>
                  <Field label="Default Risk Per Trade (%)">
                    <input type="number" className="el" value={risk} min={0.1} max={10} step={0.1}
                      onChange={e => setRisk(e.target.value)} />
                  </Field>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-gold-500/8 border border-gold-500/18">
                  <p className="text-xs text-gold-400/90 flex items-start gap-2">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                    Changing your starting balance recalculates all historical stats relative to the new value. Make sure this matches your actual account starting balance.
                  </p>
                </div>
              </Section>
            </div>

            <button type="submit" disabled={busy}
              className="btn btn-gold mt-4 text-sm w-full sm:w-auto">
              {busy
                ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <><Save size={14} /> Save Settings</>
              }
            </button>
          </form>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4 animate-fade-up d2">
          <Section title="Account Summary" icon={TrendingUp}>
            <div className="space-y-3">
              {[
                { label: 'Current Balance',   val: fmtCurrency(stats.balance),               color: 'text-white' },
                { label: 'Total P&L',         val: `${stats.totalPnL >= 0 ? '+' : ''}${fmtCurrency(stats.totalPnL)}`,
                  color: stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Total Trades',      val: stats.totalTrades,                         color: 'text-white' },
                { label: 'Win Rate',          val: `${stats.winRate}%`,                       color: 'text-gold-400' },
                { label: 'Profit Factor',     val: stats.profitFactor.toFixed(2),             color: 'text-blue-400' },
                { label: 'Max Drawdown',      val: `${stats.maxDrawdown.toFixed(2)}%`,        color: 'text-red-400' },
                { label: 'Best Trade',        val: fmtCurrency(stats.bestTrade),              color: 'text-emerald-400' },
                { label: 'Worst Trade',       val: fmtCurrency(stats.worstTrade),             color: 'text-red-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-xs text-muted">{label}</span>
                  <span className={`text-xs font-mono font-semibold ${color}`}>{val}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Danger zone */}
          <div className="card p-4 border-red-500/20 bg-red-500/[0.03]">
            <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={13} /> Account Member Since
            </p>
            <p className="text-xs text-muted font-mono">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
