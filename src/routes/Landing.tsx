import { useNavigate } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

const exampleTasks = [
  { task: 'Ship the auth module by Friday', guardian: 'Jess is watching 👀' },
  { task: 'Run 5km before Sunday', guardian: "Anna won't let you skip 💪" },
  { task: 'Read 30 pages tonight', guardian: 'Kai is on it 📖' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <MobileShell>
      {/* Header */}
      <div className="px-6 pt-14 pb-2">
        <span className="font-display text-2xl font-bold text-[#0F1B3C] tracking-tight">
          Vouch
        </span>
      </div>

      {/* Hero */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="font-display text-[2.4rem] leading-tight font-bold text-[#0F1B3C] mb-4">
          Turn 'maybe later'<br />into{' '}
          <span className="text-[#FF5E5B]">done.</span>
        </h1>
        <p className="text-[#6B7C9F] text-[1.05rem] leading-relaxed">
          A friend approves your task as done.{' '}
          <strong className="text-[#0F1B3C]">Until they click — it's failed.</strong>
        </p>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8">
        <Button onClick={() => navigate('/auth/signup')}>
          Get started →
        </Button>
      </div>

      {/* Divider */}
      <div className="px-6 pb-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-[#E8EEFA]" />
        <span className="text-xs text-[#6B7C9F] font-medium">
          What others are committing to
        </span>
        <div className="flex-1 h-px bg-[#E8EEFA]" />
      </div>

      {/* Example task cards */}
      <div className="px-6 pb-10 flex flex-col gap-3">
        {exampleTasks.map(({ task, guardian }, i) => (
          <div
            key={i}
            className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
            style={{
              background: ['#D4F0E0', '#FFF2CC', '#E8EEFA'][i],
            }}
          >
            <div>
              <p className="text-sm font-semibold text-[#0F1B3C]">{task}</p>
              <p className="text-xs text-[#6B7C9F] mt-0.5">{guardian}</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5E5B] ml-3 shrink-0" />
          </div>
        ))}
      </div>
    </MobileShell>
  )
}
