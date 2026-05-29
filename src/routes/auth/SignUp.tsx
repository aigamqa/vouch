import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

const schema = z.object({
  first_name: z.string().min(1, 'Enter your first name'),
  email: z.string().email('Enter a valid email'),
})
type FormData = z.infer<typeof schema>

const MOCK_MODE = false // set false when Supabase is configured

export default function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit({ first_name, email }: FormData) {
    setLoading(true)
    sessionStorage.setItem('vouch_email', email)
    sessionStorage.setItem('vouch_name', first_name)

    if (MOCK_MODE) {
      setTimeout(() => navigate('/auth/check-email'), 400)
      return
    }

    const { supabase } = await import('@/lib/supabase')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { data: { first_name }, shouldCreateUser: true },
    })
    setLoading(false)
    if (error) { alert(error.message); return }
    navigate('/auth/check-email')
  }

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        <button
          onClick={() => navigate(-1)}
          className="text-[#6B7C9F] text-sm mb-8 flex items-center gap-1 w-fit"
        >
          ← Back
        </button>

        <h1 className="font-display text-[2rem] leading-tight font-bold text-[#0F1B3C] mb-2">
          Quick. We'll send<br />you a link.
        </h1>
        <p className="text-[#6B7C9F] text-sm mb-8">No password. Ever.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 flex-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6B7C9F] uppercase tracking-wide">
              First name
            </label>
            <input
              {...register('first_name')}
              placeholder="Marcus"
              className="w-full h-14 rounded-2xl border border-[#E8EEFA] px-4 text-[#0F1B3C] text-base placeholder:text-[#B0BCCF] focus:outline-none focus:border-[#FF5E5B] transition-colors"
            />
            {errors.first_name && (
              <p className="text-xs text-[#FF5E5B]">{errors.first_name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6B7C9F] uppercase tracking-wide">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="marcus@example.com"
              className="w-full h-14 rounded-2xl border border-[#E8EEFA] px-4 text-[#0F1B3C] text-base placeholder:text-[#B0BCCF] focus:outline-none focus:border-[#FF5E5B] transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-[#FF5E5B]">{errors.email.message}</p>
            )}
          </div>

          <div className="mt-auto pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send me the link ✉'}
            </Button>
            <p className="text-center text-xs text-[#6B7C9F] mt-3">
              No password — we email you a link to sign in.
            </p>
          </div>
        </form>
      </div>
    </MobileShell>
  )
}
