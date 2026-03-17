'use client'
import { create } from 'zustand'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, onSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import {
  ref, uploadBytes, getDownloadURL,
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { Trade, NewsEvent, TradeFilters } from '@/types'
import { calcPnL, calcPips, calcRR } from '@/utils'

type ImageType = 'before' | 'after' | 'markup'
const IMG_KEY: Record<ImageType, keyof Trade> = {
  before: 'beforeImage', after: 'afterImage', markup: 'markupImage',
}

interface Store {
  trades:       Trade[]
  news:         NewsEvent[]
  loading:      boolean
  filters:      Partial<TradeFilters>
  unsub:        Unsubscribe | null

  subscribe:    (uid: string) => void
  unsubscribe:  () => void

  setFilters:   (f: Partial<TradeFilters>) => void
  clearFilters: () => void
  filtered:     () => Trade[]

  addTrade:     (data: Omit<Trade,'id'|'userId'|'createdAt'|'profitLoss'|'pips'|'riskReward'|'status'>, uid: string) => Promise<string>
  updateTrade:  (id: string, data: Partial<Trade>) => Promise<void>
  deleteTrade:  (id: string) => Promise<void>
  uploadImage:  (tradeId: string, file: File, type: ImageType, uid: string) => Promise<string>

  addNews:      (data: Omit<NewsEvent,'id'|'userId'>, uid: string) => Promise<void>
  deleteNews:   (id: string) => Promise<void>
}

export const useStore = create<Store>((set, get) => ({
  trades: [], news: [], loading: false, filters: {}, unsub: null,

  subscribe: (uid) => {
    get().unsub?.()
    set({ loading: true })

    // ✅ FIX: removed orderBy to avoid composite index requirement
    const tq = query(
      collection(db, 'trades'),
      where('userId', '==', uid),
    )

    const nq = query(
      collection(db, 'news'),
      where('userId', '==', uid),
    )

    const u1 = onSnapshot(tq, snap => {
      const trades = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Trade))
        .sort((a, b) => b.date.localeCompare(a.date) || (b.time ?? '').localeCompare(a.time ?? ''))
      set({ trades, loading: false })
    }, () => set({ loading: false }))

    const u2 = onSnapshot(nq, snap => {
      const news = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as NewsEvent))
        .sort((a, b) => b.date.localeCompare(a.date))
      set({ news })
    })

    set({ unsub: () => { u1(); u2() } })
  },

  unsubscribe: () => {
    get().unsub?.()
    set({ unsub: null, trades: [], news: [] })
  },

  setFilters:   f => set(s => ({ filters: { ...s.filters, ...f } })),
  clearFilters: () => set({ filters: {} }),

  filtered: () => {
    const { trades, filters } = get()
    return trades.filter(t => {
      if (filters.dateFrom && t.date < filters.dateFrom) return false
      if (filters.dateTo   && t.date > filters.dateTo)   return false
      if (filters.pair     && t.pair !== filters.pair)   return false
      if ((filters as any).session  && t.session  !== (filters as any).session)  return false
      if (filters.strategy && t.strategy !== (filters.strategy as any)) return false
      if (filters.status   && t.status   !== (filters.status   as any)) return false
      if (filters.tags?.length && !filters.tags.some(tag => t.tags?.includes(tag))) return false
      return true
    })
  },

  addTrade: async (data, uid) => {
    const pnl  = calcPnL(data)
    const pips = calcPips(data)
    const rr   = calcRR(data)
    const status: Trade['status'] = data.exitPrice
      ? (pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BREAKEVEN')
      : 'OPEN'
    const ref2 = await addDoc(collection(db, 'trades'), {
      ...data, userId: uid, profitLoss: pnl, pips, riskReward: rr, status,
      createdAt: new Date().toISOString(),
    })
    return ref2.id
  },

  updateTrade: async (id, data) => {
    const existing = get().trades.find(t => t.id === id)
    if (!existing) return
    const merged = { ...existing, ...data }
    const updates: Partial<Trade> = { ...data }
    if ('exitPrice' in data || 'entryPrice' in data || 'direction' in data || 'lotSize' in data) {
      updates.profitLoss = calcPnL(merged)
      updates.pips       = calcPips(merged)
      const pnl = updates.profitLoss
      updates.status = merged.exitPrice
        ? (pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BREAKEVEN')
        : 'OPEN'
    }
    await updateDoc(doc(db, 'trades', id), updates as any)
  },

  deleteTrade: async id => {
    await deleteDoc(doc(db, 'trades', id))
  },

  uploadImage: async (tradeId, file, type, uid) => {
    const sRef = ref(storage, `trades/${uid}/${tradeId}/${type}_${Date.now()}`)
    const snap = await uploadBytes(sRef, file)
    const url  = await getDownloadURL(snap.ref)
    await get().updateTrade(tradeId, { [IMG_KEY[type]]: url } as Partial<Trade>)
    return url
  },

  addNews: async (data, uid) => {
    await addDoc(collection(db, 'news'), { ...data, userId: uid })
  },

  deleteNews: async id => {
    await deleteDoc(doc(db, 'news', id))
  },
}))
