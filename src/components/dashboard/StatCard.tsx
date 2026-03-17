'use client'
import { LucideIcon } from 'lucide-react'
import { cx } from '@/utils'

interface Props {
  label:     string
  value:     string | number
  sub?:      string
  icon:      LucideIcon
  iconColor?: string
  trend?:    'up' | 'down' | 'neutral'
  className?: string
  delay?:    string
}

export default function StatCard({
  label, value, sub, icon: Icon,
  iconColor = 'text-gold-400',
  trend, className = '', delay = '',
}: Props) {
  return (
    <div className={`card p-5 animate-fade-up ${delay} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] uppercase tracking-widest text-muted font-semibold">{label}</p>
        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${iconColor}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className="text-2xl font-bold font-mono tracking-tight text-white">{value}</p>
      {sub && (
        <p className={`text-xs mt-1 font-mono ${
          trend === 'up' ? 'text-emerald-400' :
          trend === 'down' ? 'text-red-400' : 'text-muted'
        }`}>{sub}</p>
      )}
    </div>
  )
}
