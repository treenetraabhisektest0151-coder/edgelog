'use client'
import { useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useStore } from './TradeStore'

export function TradeStoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { subscribe, unsubscribe } = useStore()

  console.log('TradeStoreProvider user:', user?.uid) // ← ADD

  useEffect(() => {
    console.log('useEffect fired, uid:', user?.uid) // ← ADD
    if (user?.uid) {
      subscribe(user.uid)
      return () => unsubscribe()
    }
  }, [user?.uid])

  return <>{children}</>
}