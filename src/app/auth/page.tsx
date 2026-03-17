'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { TrendingUp, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode]         = useState<'in' | 'up'>('in')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [pw, setPw]             = useState('')
  const [balance, setBalance]   = useState('10000')
  const [showPw, setShowPw]     = useState(false)
  const [busy, setBusy]         = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const router                  = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'in') {
        await signIn(email, pw)
        toast.success('Welcome back.')
      } else {
        await signUp(email, pw, name, parseFloat(balance) || 10000)
        toast.success('Account created. Let\'s trade.')
      }
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err.code === 'auth/wrong-password'       ? 'Wrong password.'
                : err.code === 'auth/user-not-found'       ? 'No account with that email.'
                : err.code === 'auth/email-already-in-use' ? 'Email already registered.'
                : err.message || 'Authentication failed.'
      toast.error(msg)
    } finally { setBusy(false) }
  }

  async function handleGoogle() {
    setBusy(true)
    try {
      await signInWithGoogle()
      toast.success('Welcome back.')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed.')
    } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">

      {/* Bg blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[300px] h-[300px] rounded-full bg-blue-500/4 blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-[420px]">

        {/* Brand */}
        <div className="flex flex-col items-center mb-9 animate-fade-up">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/12 border border-gold-500/30 flex items-center justify-center mb-4">
            <TrendingUp size={22} className="text-gold" />
          </div>
          <h1 className="text-3xl font-bold gradient-text font-display tracking-tight">EdgeLog</h1>
          <p className="text-muted text-sm mt-1">Professional trading journal</p>
        </div>

        {/* Card */}
        <div className="card animate-fade-up d1 p-7">

          {/* Tabs */}
          <div className="flex bg-white/[0.04] rounded-xl p-1 mb-7">
            {(['in','up'] as const).map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === m ? 'bg-gold-500 text-black shadow-md' : 'text-muted hover:text-white/70'
                }`}>
                {m === 'in' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'up' && (
              <Field label="Your Name">
                <input className="el" placeholder="Full name" value={name}
                  onChange={e => setName(e.target.value)} required />
              </Field>
            )}
            <Field label="Email">
              <input type="email" className="el" placeholder="trader@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="el pr-10"
                  placeholder="••••••••" value={pw}
                  onChange={e => setPw(e.target.value)} required minLength={6} />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            {mode === 'up' && (
              <Field label="Starting Balance (USD)">
                <input type="number" className="el" placeholder="10000"
                  value={balance} onChange={e => setBalance(e.target.value)} min={0} />
              </Field>
            )}

            <button type="submit" disabled={busy}
              className="btn btn-gold w-full mt-2 text-sm">
              {busy
                ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <>{mode === 'in' ? 'Enter Dashboard' : 'Create Account'}<ArrowRight size={15} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-muted text-xs">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 text-sm text-white/70 hover:text-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
              <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" fill="#FFC107"/>
              <path d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" fill="#FF3D00"/>
              <path d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-8H6.3C9.7 35.6 16.3 44 24 44z" fill="#4CAF50"/>
              <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </button>

        </div>

        <p className="text-center text-muted text-xs mt-5 animate-fade-up d2">
          Firebase Auth · Free tier · No paid APIs
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-muted mb-1.5 font-semibold">
        {label}
      </label>
      {children}
    </div>
  )
}