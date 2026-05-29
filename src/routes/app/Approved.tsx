import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

const CONFETTI = ['🎉','🎊','✨','🏆','⭐','💚','🎯']

export default function Approved() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pieces, setPieces] = useState<{ emoji: string; x: number; delay: number }[]>([])

  useEffect(() => {
    setPieces(
      Array.from({ length: 12 }, (_, i) => ({
        emoji: CONFETTI[i % CONFETTI.length],
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
      }))
    )
  }, [])

  return (
    <MobileShell>
      <div className="flex flex-col flex-1 relative overflow-hidden">
        {/* Confetti */}
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute text-2xl pointer-events-none animate-bounce"
            style={{ left: `${p.x}%`, top: `${8 + (i % 3) * 8}%`, animationDelay: `${p.delay}s` }}
          >
            {p.emoji}
          </span>
        ))}

        <div className="px-6 pt-20 pb-10 flex flex-col flex-1 items-center">
          {/* Hero */}
          <div className="w-36 h-36 rounded-full bg-[#D4F0E0] flex items-center justify-center text-7xl mb-6 shadow-lg">
            🤝
          </div>

          <h1 className="font-display text-[2.4rem] font-bold text-[#0F1B3C] text-center mb-3">
            Jess approved!
          </h1>
          <p className="text-[#6B7C9F] text-base text-center mb-2">Ship the auth module</p>
          <div className="bg-[#D4F0E0] rounded-full px-4 py-2 mb-10">
            <p className="text-sm font-bold text-[#166534]">Task complete ✓</p>
          </div>

          {/* Evidence thumbnail placeholder */}
          <div className="w-full rounded-2xl border border-[#E8EEFA] bg-[#F7F8FA] h-36 flex items-center justify-center mb-10">
            <p className="text-sm text-[#B0BCCF]">Your evidence</p>
          </div>

          <div className="w-full flex flex-col gap-3 mt-auto">
            <Button onClick={() => navigate('/app/tasks/new')}>
              Plan next task →
            </Button>
            <button
              onClick={() => {
                const text = 'Just completed a task with Vouch! 🎉 vouch.fyi'
                if (navigator.share) navigator.share({ text }).catch(() => {})
                else navigator.clipboard.writeText(text)
              }}
              className="w-full h-14 rounded-full border border-[#E8EEFA] text-[#6B7C9F] font-semibold text-base"
            >
              Share this win ↗
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  )
}
