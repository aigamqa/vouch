import { useNavigate } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { useTasks, useProfile } from '@/features/tasks/api'

const TONE_BG: Record<string, string> = {
  supportive: '#D4F0E0', playful: '#FFF2CC', hardcore: '#FFE4E1',
}
const STATUS_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  pending:      { text: 'Waiting for Guardian', color: '#6B7C9F', bg: '#E8EEFA' },
  submitted:    { text: 'Awaiting verdict',     color: '#92400E', bg: '#FFF2CC' },
  approved:     { text: 'Approved ✓',           color: '#166534', bg: '#D4F0E0' },
  rejected:     { text: 'Rejected',             color: '#991B1B', bg: '#FFE4E1' },
  ghost_failed: { text: 'Ghost failed',         color: '#6B7C9F', bg: '#E8EEFA' },
}

function timeLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff < 0) return { label: 'Overdue', overdue: true }
  const h = Math.floor(diff / 3_600_000)
  if (h < 24) return { label: `${h}h left`, overdue: false }
  return { label: `${Math.floor(h / 24)}d left`, overdue: false }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const { data: tasks = [], isLoading } = useTasks()
  const name = profile?.first_name ?? sessionStorage.getItem('vouch_name') ?? 'you'

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6B7C9F] font-medium">Good work,</p>
          <h1 className="font-display text-xl font-bold text-[#0F1B3C] capitalize">{name}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#D4F0E0] flex items-center justify-center">
          <span className="text-sm font-bold text-[#166534] uppercase">{name.charAt(0)}</span>
        </div>
      </div>

      <div className="px-6 pb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#0F1B3C]">Your commitments</h2>
        <span className="text-xs text-[#6B7C9F]">{tasks.length} active</span>
      </div>

      <div className="px-6 flex flex-col gap-3 pb-32">
        {isLoading && (
          <div className="py-12 text-center text-[#6B7C9F] text-sm">Loading…</div>
        )}

        {!isLoading && tasks.length === 0 && (
          <div className="text-center py-16 text-[#6B7C9F]">
            <p className="text-4xl mb-4">🎯</p>
            <p className="font-semibold text-[#0F1B3C]">No active commitments</p>
            <p className="text-sm mt-1">Create your first task below</p>
          </div>
        )}

        {tasks.map(task => {
          const { label, overdue } = timeLeft(task.deadline)
          const status = STATUS_LABEL[task.status] ?? STATUS_LABEL.pending
          const guardianName = task.guardian?.display_name ?? 'Guardian'
          const tone = task.tone ?? 'supportive'

          return (
            <div
              key={task.id}
              onClick={() => navigate(`/app/tasks/${task.id}`)}
              className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer active:scale-[0.98] transition-transform"
              style={{ background: TONE_BG[tone] }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-[#0F1B3C] text-base leading-snug flex-1">{task.title}</p>
                <div className="flex items-center gap-1.5 shrink-0 bg-white rounded-full px-2 py-1">
                  <div className="w-5 h-5 rounded-full bg-[#FF5E5B] flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{guardianName[0]}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#0F1B3C]">{guardianName}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: overdue ? '#991B1B' : '#6B7C9F' }}>
                  {overdue ? '⚠️ ' : '⏰ '}{label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold rounded-full px-2.5 py-1"
                    style={{ color: status.color, background: status.bg }}>
                    {status.text}
                  </span>
                  {task.status === 'pending' && (
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/app/tasks/${task.id}`) }}
                      className="text-xs font-bold bg-[#FF5E5B] text-white rounded-full px-3 py-1"
                    >
                      Upload
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 pointer-events-none">
        <button
          onClick={() => navigate('/app/tasks/new')}
          className="pointer-events-auto w-full h-14 rounded-full bg-[#0F1B3C] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-transform"
        >
          <span className="text-xl leading-none">+</span>
          New task
        </button>
      </div>
    </MobileShell>
  )
}
