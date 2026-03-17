'use client'
import { create } from 'zustand'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, onSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import {
  ref, uploadBytes, getDownloadURL, deleteObject,
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { Trade, NewsEvent, TradeFilters } from '@/types'
import { calcPnL, calcPips, calcRR, tradeStatus } from '@/utils'

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

  // lifecycle
  subscribe:    (uid: string) => void
  unsubscribe:  () => void

  // filters
  setFilters:   (f: Partial<TradeFilters>) => void
  clearFilters: () => void
  filtered:     () => Trade[]

  // trades CRUD
  addTrade:     (data: Omit<Trade,'id'|'userId'|'createdAt'|'profitLoss'|'pips'|'riskReward'|'status'>, uid: string) => Promise<string>
  updateTrade:  (id: string, data: Partial<Trade>) => Promise<void>
  deleteTrade:  (id: string) => Promise<void>
  uploadImage:  (tradeId: string, file: File, type: ImageType, uid: string) => Promise<string>

  // news CRUD
  addNews:      (data: Omit<NewsEvent,'id'|'userId'>, uid: string) => Promise<void>
  deleteNews:   (id: string) => Promise<void>
}

export const useStore = create<Store>((set, get) => ({
  trades: [], news: [], loading: false, filters: {}, unsub: null,

  subscribe: (uid) => {
    get().unsub?.()
    set({ loading: true })

    const tq = query(
      collection(db, 'trades'),
      where('userId','==', uid),
      orderBy('date','desc'),
      orderBy('time','desc'),
    )
    const nq = query(
      collection(db, 'news'),
      where('userId','==', uid),
      orderBy('date','desc'),
    )

    const u1 = onSnapshot(tq, snap => {
      set({ trades: snap.docs.map(d => ({ id: d.id, ...d.data() } as Trade)), loading: false })
    }, () => set({ loading: false }))

    const u2 = onSnapshot(nq, snap => {
      set({ news: snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsEvent)) })
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
    const pnl    = calcPnL(data.direction, data.entryPrice, data.exitPrice, data.lotSize, data.pair)
    const pips   = calcPips(data.direction, data.entryPrice, data.exitPrice, data.pair)
    const rr     = calcRR(data.direction, data.entryPrice, data.stopLoss, data.takeProfit)
    const status = data.exitPrice ? tradeStatus(pnl) : 'OPEN'
    const ref2   = await addDoc(collection(db, 'trades'), {
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
      updates.profitLoss = calcPnL(merged.direction, merged.entryPrice, merged.exitPrice, merged.lotSize, merged.pair)
      updates.pips       = calcPips(merged.direction, merged.entryPrice, merged.exitPrice, merged.pair)
      updates.status     = tradeStatus(updates.profitLoss)
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
