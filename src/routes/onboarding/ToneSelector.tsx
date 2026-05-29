import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

const tones = [
  {
    id: 'supportive',
    name: 'Supportive',
    desc: 'A friend checks in. No consequences if you miss. Quiet support.',
    emoji: '🤗',
    bg: '#D4F0E0',
    recommended: true,
  },
  {
    id: 'playful',
    name: 'Playful',
    desc: 'Light social pressure. Funny consequences if you skip.',
    emoji: '😄',
    bg: '#FFF2CC',
    recommended: false,
  },
  {
    id: 'hardcore',
    name: 'Hardcore',
    desc: 'Real stakes. Pre-chosen consequence executes on failure.',
    emoji: '💀',
    bg: '#FFE4E1',
    recommended: false,
  },
] as const

type ToneId = 'supportive' | 'playful' | 'hardcore'

export default function ToneSelector() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<ToneId>('supportive')

  function handleContinue() {
    sessionStorage.setItem('vouch_tone', selected)
    if (selected === 'hardcore') {
      navigate('/onboarding/hardcore-consent')
    } else {
      navigate('/onboarding/privacy')
    }
  }

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        <h1 className="font-display text-[2rem] leading-tight font-bold text-[#0F1B3C] mb-2">
          How do you want<br />this to feel?
        </h1>
        <p className="text-[#6B7C9F] text-sm mb-8">You can change this any time in Settings.</p>

        <div className="flex flex-col gap-3 flex-1">
          {tones.map(tone => (
            <button
              key={tone.id}
              onClick={() => setSelected(tone.id)}
              className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all"
              style={{
                background: tone.bg,
                outline: selected === tone.id ? '2.5px solid #FF5E5B' : '2.5px solid transparent',
              }}
            >
              <span className="text-4xl shrink-0">{tone.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#0F1B3C] text-base">{tone.name}</span>
                  {tone.recommended && (
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-[#FF5E5B] text-white rounded-full px-2 py-0.5">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6B7C9F] leading-snug">{tone.desc}</p>
              </div>
              <div
                className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
                style={{
                  borderColor: selected === tone.id ? '#FF5E5B' : '#B0BCCF',
                  background: selected === tone.id ? '#FF5E5B' : 'transparent',
                }}
              >
                {selected === tone.id && <span className="text-white text-xs">✓</span>}
              </div>
            </button>
          ))}
        </div>

        <div className="pt-6">
          <Button onClick={handleContinue}>Continue →</Button>
        </div>
      </div>
    </MobileShell>
  )
}
