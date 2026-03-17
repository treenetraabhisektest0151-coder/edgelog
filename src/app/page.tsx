'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Root() {
  const { user, authLoading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!authLoading) router.replace(user ? '/dashboard' : '/auth')
  }, [user, authLoading])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
    </div>
  )
}
