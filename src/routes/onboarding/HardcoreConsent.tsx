import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

const items = [
  'Consequences will execute as defined.',
  'You accept full responsibility for stake selection.',
  'You can change tone any time in Settings.',
]

export default function HardcoreConsent() {
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        <button onClick={() => navigate(-1)} className="text-[#6B7C9F] text-sm mb-8 flex items-center gap-1 w-fit">
          ← Back
        </button>

        {/* Hardcore hero */}
        <div className="w-full rounded-2xl bg-[#FFE4E1] flex items-center justify-center py-8 mb-6 text-6xl">
          💀
        </div>

        <h1 className="font-display text-[1.8rem] leading-tight font-bold text-[#0F1B3C] mb-6">
          You picked Hardcore<br />— read carefully.
        </h1>

        {/* ToS items */}
        <div className="rounded-2xl border border-[#E8EEFA] bg-white p-5 flex flex-col gap-4 mb-6">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#FFE4E1] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs">⚡</span>
              </div>
              <p className="text-sm text-[#0F1B3C] leading-snug">{item}</p>
            </div>
          ))}
        </div>

        {/* Checkbox */}
        <button
          onClick={() => setAccepted(v => !v)}
          className="flex items-center gap-3 mb-8 w-full rounded-2xl border border-[#E8EEFA] bg-white px-4 py-4"
        >
          <div
            className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all"
            style={{
              borderColor: accepted ? '#FF5E5B' : '#B0BCCF',
              background: accepted ? '#FF5E5B' : 'white',
            }}
          >
            {accepted && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <span className="text-sm font-semibold text-[#0F1B3C]">I understand and accept.</span>
        </button>

        <div className="mt-auto">
          <Button disabled={!accepted} onClick={() => navigate('/onboarding/privacy')}>
            Continue →
          </Button>
        </div>
      </div>
    </MobileShell>
  )
}
