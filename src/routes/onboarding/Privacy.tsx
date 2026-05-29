import { useNavigate } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

const canSee = ['Task title', 'Deadline', 'Evidence you upload', 'Your name']
const cantSee = ["Your other tasks", "History with other Guardians", "Data you didn't upload"]

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        <h1 className="font-display text-[2rem] leading-tight font-bold text-[#0F1B3C] mb-2">
          Your Guardian sees<br />what you choose.
        </h1>
        <p className="text-[#6B7C9F] text-sm mb-8">
          You're always in control of what's shared.
        </p>

        {/* Two-column grid */}
        <div className="flex gap-3 mb-6">
          {/* Can see */}
          <div className="flex-1 rounded-2xl bg-[#D4F0E0] p-4 flex flex-col gap-3">
            <p className="text-xs font-bold text-[#166534] uppercase tracking-wide">✅ Can see</p>
            {canSee.map(item => (
              <p key={item} className="text-sm text-[#166534] leading-snug">· {item}</p>
            ))}
          </div>
          {/* Can't see */}
          <div className="flex-1 rounded-2xl bg-[#FFE4E1] p-4 flex flex-col gap-3">
            <p className="text-xs font-bold text-[#991B1B] uppercase tracking-wide">❌ Can't see</p>
            {cantSee.map(item => (
              <p key={item} className="text-sm text-[#991B1B] leading-snug">· {item}</p>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-[#6B7C9F] mb-8">
          You can delete a Guardian or all your data any time.
        </p>

        <div className="mt-auto">
          <Button onClick={() => navigate('/app')}>
            Got it, continue →
          </Button>
        </div>
      </div>
    </MobileShell>
  )
}
