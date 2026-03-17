'use client'
import { useEffect, ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  open:     boolean
  onClose:  () => void
  title?:   string
  maxW?:    string
  children: ReactNode
}

export default function Modal({ open, onClose, title, maxW = 'max-w-xl', children }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal w-full ${maxW}`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
            <h2 className="font-bold text-white font-display">{title}</h2>
            <button onClick={onClose} className="p-1.5 text-muted hover:text-white hover:bg-white/6 rounded-lg transition-colors">
              <X size={17} />
            </button>
          </div>
        )}
        {!title && (
          <button onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-muted hover:text-white hover:bg-white/6 rounded-lg transition-colors z-10">
            <X size={17} />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
