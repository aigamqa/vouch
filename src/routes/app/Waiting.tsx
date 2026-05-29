import { useNavigate } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

export default function Waiting() {
  const navigate = useNavigate()
  const raw = sessionStorage.getItem('vouch_task')
  const task = raw ? JSON.parse(raw) : { title: 'Your task' }

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        {/* Status */}
        <div className="flex flex-col items-center text-center py-10 gap-4">
          <div className="w-20 h-20 rounded-full bg-[#D4F0E0] flex items-center justify-center text-4xl animate-pulse">
            ⏳
          </div>
          <h1 className="font-display text-[1.8rem] font-bold text-[#0F1B3C] leading-tight">
            Waiting for your<br />Guardian to accept.
          </h1>
          <p className="text-[#6B7C9F] text-sm">
            We sent them a link. One tap to accept.
          </p>
        </div>

        {/* Task summary */}
        <div className="rounded-2xl border border-[#E8EEFA] bg-white px-4 py-4 flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-[#0F1B3C] text-sm">{task.title}</p>
            <p className="text-xs text-[#6B7C9F] mt-0.5">Stake: {task.stake_id ? 'Active 🔥' : 'None'}</p>
          </div>
          <span className="text-xs font-bold bg-[#FFF2CC] text-[#92400E] rounded-full px-3 py-1">
            ⏳ Pending
          </span>
        </div>

        {/* Swap option */}
        <div className="rounded-2xl border border-[#E8EEFA] bg-white px-4 py-4 flex flex-col gap-3 mb-8">
          <p className="text-xs font-bold text-[#B0BCCF]">⏱ No response after 2 hours?</p>
          <button className="w-full h-11 rounded-xl border border-[#E8EEFA] text-sm font-semibold text-[#0F1B3C]">
            Invite someone else
          </button>
        </div>

        <div className="mt-auto">
          <Button onClick={() => navigate('/app')}>
            Back to dashboard
          </Button>
        </div>
      </div>
    </MobileShell>
  )
}
