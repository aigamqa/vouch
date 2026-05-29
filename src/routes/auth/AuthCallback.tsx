import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Handle magic link click — Supabase puts tokens in the URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/onboarding/welcome', { replace: true })
        return
      }
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe()
          navigate('/onboarding/welcome', { replace: true })
        }
      })
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-4xl mb-4 animate-spin inline-block">⏳</p>
        <p className="text-[#6B7C9F] text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
