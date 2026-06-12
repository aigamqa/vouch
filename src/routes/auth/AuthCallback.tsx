import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

async function getDestination(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  // Profile exists → returning user → go to dashboard
  // No profile → new user → complete onboarding
  if (!error && data) return '/app'
  return '/onboarding/welcome'
}

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const dest = await getDestination(session.user.id)
        navigate(dest, { replace: true })
        return
      }
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          subscription.unsubscribe()
          const dest = await getDestination(session.user.id)
          navigate(dest, { replace: true })
        }
      })
    }
    handleCallback()
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
