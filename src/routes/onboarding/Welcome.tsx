import { useNavigate } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

export default function Welcome() {
  const navigate = useNavigate()
  const name = sessionStorage.getItem('vouch_name') ?? ''

  return (
    <MobileShell>
      <div className="px-6 pt-16 pb-10 flex flex-col flex-1">
        {/* Illustration */}
        <div className="flex-1 flex flex-col items-center justify-center gap-10">
          <div className="w-48 h-48 rounded-full bg-[#D4F0E0] flex items-center justify-center text-8xl select-none">
            🤝
          </div>

          <div className="text-center">
            <h1 className="font-display text-[2.2rem] leading-tight font-bold text-[#0F1B3C] mb-4">
              {name ? `Hey ${name}.` : 'Hey.'}<br />
              Pick a task.<br />
              A friend holds<br />you to it.
            </h1>
            <p className="text-[#6B7C9F] text-base leading-relaxed max-w-xs mx-auto">
              Until they approve your evidence —<br />
              <strong className="text-[#0F1B3C]">the task is failed. That's it.</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6">
          <Button onClick={() => navigate('/onboarding/tone')}>
            Let's go →
          </Button>
          <button
            onClick={() => navigate('/onboarding/tone')}
            className="text-center text-sm text-[#6B7C9F] underline"
          >
            How this works
          </button>
        </div>
      </div>
    </MobileShell>
  )
}
