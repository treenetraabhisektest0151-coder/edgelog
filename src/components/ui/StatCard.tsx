"use client";

import React from 'react'

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({
  label,
  value,
  change,
  prefix = "",
  suffix = "",
  icon,
  className = "",
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#0f1117] p-5 shadow-lg ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AA50]/60 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-white/40 mb-2">
            {label}
          </p>
          <p className="text-2xl font-bold text-white truncate">
            <span className="text-white/50 text-lg">{prefix}</span>
            {typeof value === "number" ? value.toLocaleString() : value}
            <span className="text-white/50 text-lg">{suffix}</span>
          </p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-semibold ${
                  isPositive
                    ? "text-emerald-400"
                    : isNegative
                    ? "text-red-400"
                    : "text-white/40"
                }`}
              >
                {isPositive ? "▲" : isNegative ? "▼" : "–"}{" "}
                {Math.abs(change).toFixed(2)}%
              </span>
              <span className="text-xs text-white/30">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#D4AA50]/10 border border-[#D4AA50]/20 flex items-center justify-center text-[#D4AA50]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
