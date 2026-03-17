'use client'
import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label:      string
  value:      string | number
  sub?:       string
  icon?:      LucideIcon
  iconColor?: string
  delay?:     string
  trend?:     'up' | 'down'
  change?:    number
  prefix?:    string
  suffix?:    string
  className?: string
}

export default function StatCard({
  label, value, sub, icon: Icon, iconColor = 'text-gold-400',
  delay, trend, change, prefix = '', suffix = '', className = '',
}: StatCardProps) {
  return (
    <div className={`card p-4 animate-fade-up ${delay ?? ''} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-1.5">
            {label}
          </p>
          <p className="text-xl font-bold font-mono text-white truncate">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {sub && (
            <p className="text-[11px] text-muted mt-1">{sub}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xs font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${iconColor}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      {trend && (
        <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${
          trend === 'up' ? 'bg-emerald-500/40' : 'bg-red-500/40'
        }`} />
      )}
    </div>
  )
}
