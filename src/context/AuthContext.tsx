'use client'
import {
  createContext, useContext, useEffect, useState, ReactNode,
} from 'react'
import {
  User, onAuthStateChanged,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, updateProfile, signInWithPopup,        // ← added
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebase'  // ← added googleProvider
import { UserProfile } from '@/types'

interface Ctx {
  user:        User | null
  profile:     UserProfile | null
  authLoading: boolean
  signIn:  (email: string, pw: string) => Promise<void>
  signUp:  (email: string, pw: string, name: string, balance: number) => Promise<void>
  logOut:  () => Promise<void>
  refreshProfile: () => Promise<void>
  signInWithGoogle: () => Promise<void>            // ← added
}

const AuthCtx = createContext<Ctx>({} as Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,        setUser]        = useState<User | null>(null)
  const [profile,     setProfile]     = useState<UserProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  async function loadProfile(uid: string) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) setProfile(snap.data() as UserProfile)
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u) await loadProfile(u.uid)
      else    setProfile(null)
      setAuthLoading(false)
    })
  }, [])

  async function signIn(email: string, pw: string) {
    await signInWithEmailAndPassword(auth, email, pw)
  }

  async function signUp(email: string, pw: string, name: string, balance: number) {
    const { user: u } = await createUserWithEmailAndPassword(auth, email, pw)
    await updateProfile(u, { displayName: name })
    const p: UserProfile = {
      uid: u.uid, email, displayName: name,
      startingBalance: balance, currency: 'USD',
      riskPerTrade: 1,
      createdAt: new Date().toISOString(),
    }
    await setDoc(doc(db, 'users', u.uid), p)
    setProfile(p)
  }

  async function logOut() {
    await signOut(auth)
    setUser(null); setProfile(null)
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.uid)
  }

  async function signInWithGoogle() {              // ← added
    const result = await signInWithPopup(auth, googleProvider)
    const u = result.user
    const ref = doc(db, 'users', u.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const p: UserProfile = {
        uid: u.uid,
        email: u.email ?? '',
        displayName: u.displayName ?? '',
        startingBalance: 0,
        currency: 'USD',
        riskPerTrade: 1,
        createdAt: new Date().toISOString(),
      }
      await setDoc(ref, p)
      setProfile(p)
    } else {
      await loadProfile(u.uid)
    }
  }

  return (
    <AuthCtx.Provider value={{
      user, profile, authLoading, signIn, signUp, logOut,
      refreshProfile, signInWithGoogle,            // ← added
    }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)