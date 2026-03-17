'use client'
import { TAGS } from '@/lib/constants'
import { TradeTag } from '@/types'

interface Props {
  value:    TradeTag[]
  onChange: (tags: TradeTag[]) => void
}

export default function TagSelector({ value, onChange }: Props) {
  function toggle(t: TradeTag) {
    onChange(value.includes(t) ? value.filter(x => x !== t) : [...value, t])
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {TAGS.map(t => (
        <button key={t} type="button" onClick={() => toggle(t as TradeTag)}
          className={`tag ${value.includes(t as TradeTag) ? 'on' : ''}`}>
          {t}
        </button>
      ))}
    </div>
  )
}
