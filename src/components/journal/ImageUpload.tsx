'use client'
import { useState, useRef, DragEvent } from 'react'
import { Upload, Image as ImgIcon, X, Loader2 } from 'lucide-react'
import { useStore } from '@/context/TradeStore'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

interface Props {
  tradeId:  string
  type:     'before' | 'after' | 'markup'
  label:    string
  existing?: string
}

export default function ImageUpload({ tradeId, type, label, existing }: Props) {
  const [preview, setPreview] = useState<string>(existing || '')
  const [busy, setBusy]       = useState(false)
  const [drag, setDrag]       = useState(false)
  const inputRef              = useRef<HTMLInputElement>(null)
  const { uploadImage }       = useStore()
  const { user }              = useAuth()

  async function handle(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Images only'); return }
    if (file.size > 5_000_000) { toast.error('Max 5 MB'); return }
    setBusy(true)
    try {
      const url = await uploadImage(tradeId, file, type, user!.uid)
      setPreview(url)
      toast.success(`${label} uploaded`)
    } catch { toast.error('Upload failed') }
    finally { setBusy(false) }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) handle(f)
  }

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-1.5">{label}</p>
      {preview ? (
        <div className="relative group rounded-lg overflow-hidden border border-white/10" style={{ aspectRatio: '16/9' }}>
          <img src={preview} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button onClick={() => inputRef.current?.click()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <Upload size={15} />
            </button>
            <button onClick={() => setPreview('')}
              className="p-2 bg-red-500/20 hover:bg-red-500/35 rounded-lg transition-colors text-red-400">
              <X size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`dropzone ${drag ? 'dragging' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => !busy && inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 size={20} className="animate-spin text-gold-400 mb-1" />
          ) : (
            <ImgIcon size={20} className="text-gold-400/60 mb-1" />
          )}
          <p className="text-xs text-muted text-center">
            {busy ? 'Uploading…' : 'Drop image or click to browse'}
          </p>
          <p className="text-[11px] text-muted/60 mt-0.5">PNG, JPG, WebP · max 5 MB</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = '' }} />
    </div>
  )
}
