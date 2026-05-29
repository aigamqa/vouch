import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

const MOCK_MODE = false

export default function CheckEmail() {
  const navigate = useNavigate()
  const email = sessionStorage.getItem('vouch_email') ?? ''
  const name = sessionStorage.getItem('vouch_name') ?? ''

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  async function verify(token: string) {
    if (token.length < 6) return
    setLoading(true)
    setError(null)

    if (MOCK_MODE) {
      setTimeout(() => navigate('/onboarding/welcome'), 500)
      return
    }

    const { supabase } = await import('@/lib/supabase')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    setLoading(false)
    if (error) {
      setError("That code didn't work — check and try again.")
      setCode('')
    } else {
      navigate('/onboarding/welcome')
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '')
    setCode(val)
    if (val.length >= 6) verify(val)
  }

  async function resend() {
    if (!MOCK_MODE) {
      const { supabase } = await import('@/lib/supabase')
      await supabase.auth.signInWithOtp({ email })
    }
    setResent(true)
    setTimeout(() => setResent(false), 4000)
  }

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        <button onClick={() => navigate(-1)} className="text-[#6B7C9F] text-sm mb-8 flex items-center gap-1 w-fit">
          ← Back
        </button>

        <h1 className="font-display text-[2rem] leading-tight font-bold text-[#0F1B3C] mb-2">
          Check your inbox,<br />{name} 👋
        </h1>
        <p className="text-[#6B7C9F] text-sm mb-6">
          We sent a code to <strong className="text-[#0F1B3C]">{email}</strong>
        </p>

        <div className="rounded-2xl bg-[#D4F0E0] px-4 py-4 flex items-center gap-3 mb-6">
          <span className="text-2xl">✉️</span>
          <div>
            <p className="font-semibold text-[#0F1B3C] text-sm">Email sent!</p>
            <p className="text-xs text-[#6B7C9F]">Check your inbox</p>
          </div>
        </div>

        {/* Single code input */}
        <div className="flex flex-col gap-2 mb-5">
          <label className="text-xs font-semibold text-[#6B7C9F] uppercase tracking-wide">
            Enter your code
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={handleChange}
            placeholder="Enter code from email"
            disabled={loading}
            autoFocus
            className="w-full h-16 rounded-2xl border border-[#E8EEFA] px-5 text-[#0F1B3C] text-2xl font-bold tracking-widest placeholder:text-[#B0BCCF] placeholder:text-base placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-[#FF5E5B] transition-colors disabled:opacity-50"
          />
        </div>

        {error && (
          <p className="text-sm text-[#FF5E5B] bg-[#FFE4E1] rounded-xl px-4 py-3 mb-4">{error}</p>
        )}

        {loading && (
          <p className="text-sm text-[#6B7C9F] text-center mb-4 animate-pulse">Verifying…</p>
        )}

        <div className="rounded-2xl bg-[#FFF2CC] px-4 py-3 mb-6">
          <p className="text-xs font-semibold text-[#0F1B3C] mb-1">💡 On iPhone with Gmail or Outlook?</p>
          <p className="text-xs text-[#6B7C9F] leading-relaxed">
            Tap-hold the link → Open in Safari. Or paste the code above.
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Button disabled={code.length < 6 || loading} onClick={() => verify(code)}>
            {loading ? 'Verifying…' : 'Verify code →'}
          </Button>
          <button onClick={resend} className="text-sm text-[#FF5E5B] font-semibold underline text-center">
            {resent ? '✓ Resent!' : 'Resend email'}
          </button>
        </div>
      </div>
    </MobileShell>
  )
}
